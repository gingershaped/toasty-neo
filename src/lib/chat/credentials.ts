import { Host } from "@prisma/client";
import { Cookie, CookieJar } from "tough-cookie";
import { logger } from "../logger";
import got from "got";
import parse from "node-html-parser";
import { open } from "fs/promises";
import { PathLike } from "fs";
import { z } from "zod";
import { hostSchema } from "../schema";
import { HOST_ADDRESSES } from "../util";

const USER_AGENT = "Mozilla/5.0 (compatible; toasty/1;)";

const rootLogger = logger.child({ module: "bot" });

const cookieSchema = z.unknown().transform((val, ctx) => {
    const cookie = Cookie.fromJSON(val);
    if (cookie == undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Not a cookie",
        });
        return z.NEVER;
    }
    return cookie;
});

export class Credentials {
    private static logger = rootLogger.child({ name: "credentials" });
    private static SCHEMA = z.object({
        host: hostSchema,
        userId: z.number(),
        acct: cookieSchema,
        prov: cookieSchema,
        chatusr: cookieSchema,
    });
    private constructor(
        readonly host: Host,
        readonly userId: number,
        private readonly acct: Cookie,
        private readonly prov: Cookie,
        private readonly chatusr: Cookie,
    ) {}

    cookieJar() {
        const jar = new CookieJar();
        const cookieRoot = this.host == "SO" ? "https://stackoverflow.com" : "https://stackexchange.com";
        jar.setCookieSync(this.acct, cookieRoot);
        jar.setCookieSync(this.prov, cookieRoot);
        jar.setCookieSync(this.chatusr, HOST_ADDRESSES[this.host].toString());
        return jar;
    }

    client() {     
        return got.extend({
            cookieJar: this.cookieJar(),
            prefixUrl: HOST_ADDRESSES[this.host],
            headers: {
                "User-Agent": USER_AGENT,
            },
        });
    }

    static async authenticate(email: string, password: string, host: Host) {
        this.logger.info(`Logging into ${host}`);
        const chatUserCookie = host == "SE" ? "sechatusr" : "chatusr";
        const loginHost = host == "SO" ? "https://stackoverflow.com" : "https://meta.stackexchange.com";
        const cookieRoot = host == "SO" ? "https://stackoverflow.com" : "https://stackexchange.com";
        
        const qaCookieJar = new CookieJar();
        const qaClient = got.extend({
            cookieJar: qaCookieJar,
            prefixUrl: loginHost,
            headers: {
                "User-Agent": USER_AGENT,
            },
        });
        const loginPage = parse((await qaClient.get("users/login")).body);
        const qaFkey = loginPage.getElementById("login-form")!.querySelector(`[name="fkey"]`)!.getAttribute("value")!;
        this.logger.debug(`QA fkey is ${qaFkey}`);
        const trackForm = new FormData();
        trackForm.set("isSignup", "false");
        trackForm.set("isLogin", "true");
        trackForm.set("isPassword", "false");
        trackForm.set("isAddLogin", "false");
        trackForm.set("fkey", qaFkey);
        trackForm.set("ssrc", "head");
        trackForm.set("email", email);
        trackForm.set("password", password);
        trackForm.set("oauthversion", "");
        trackForm.set("oauthserver", "");
        const trackResponse = await qaClient.post("users/login-or-signup/validation/track", { body: trackForm });
        if (!trackResponse.ok) {
            throw new Error(`Login host responded with a non-ok status code ${trackResponse.statusCode}`);
        }
        const loginForm = new FormData();
        loginForm.set("fkey", qaFkey);
        loginForm.set("ssrc", "login");
        loginForm.set("email", email);
        loginForm.set("password", password);
        loginForm.set("oauth_version", "");
        loginForm.set("oauth_server", "");
        const loginResponse = await qaClient.post("users/login", { body: loginForm, followRedirect: false });
        if (loginResponse.statusCode != 302) {
            throw new Error("Login failed! Incorrect username or password?");
        }
        const redirectTarget = new URL(loginResponse.headers["location"]!, loginHost);
        if (redirectTarget.pathname != "/") {
            throw new Error(`Login failed! Redirected to ${redirectTarget}; caught by captcha?`);
        }

        const { acct, prov } = Object.fromEntries(qaCookieJar.getCookiesSync(cookieRoot).map((cookie) => [cookie.key, cookie]));

        const chatCookieJar = new CookieJar();
        chatCookieJar.setCookieSync(acct, cookieRoot);
        chatCookieJar.setCookieSync(prov, cookieRoot);
        const chatClient = got.extend({
            cookieJar: chatCookieJar,
            prefixUrl: HOST_ADDRESSES[host],
            headers: {
                "User-Agent": USER_AGENT,
            },
        });
        const chatIndexResponse = await chatClient.get("");
        const chatusr = chatCookieJar.getCookiesSync(HOST_ADDRESSES[host].toString()).find(({ key }) => key == chatUserCookie);
        if (chatusr == undefined) {
            throw new Error(`Login failed! ${chatUserCookie} not in cookies returned from ${HOST_ADDRESSES[host]}`);
        }
        const profileLink = new URL(parse(chatIndexResponse.body).querySelector(".topbar-menu-links a")!.getAttribute("href")!, HOST_ADDRESSES[host]);
        if (profileLink.host == "stackexchange.com") {
            throw new Error("The supplied credentials were not accepted by chat! Bad username or password?");
        }
        const userId = parseInt(profileLink.pathname.split("/")[2]);

        this.logger.info(`Logged into chat successfully! Our user ID is ${userId}`);
        return new Credentials(host, userId, acct, prov, chatusr);
    }

    async save(path: PathLike) {
        const file = await open(path, "w");
        try {
            await file.writeFile(JSON.stringify({
                host: this.host,
                userId: this.userId,
                acct: this.acct.toJSON(),
                prov: this.prov.toJSON(),
                chatusr: this.chatusr.toJSON(),
            }));
        } finally {
            await file.close();
        }
    }

    static async load(path: PathLike) {
        this.logger.info(`Reading credentials from ${path}`);
        const file = await open(path, "r");
        let credentials: Credentials;
        try {
            const { host, userId, acct, prov, chatusr } = this.SCHEMA.parse(JSON.parse(await file.readFile("utf-8")));
            credentials = new Credentials(host, userId, acct, prov, chatusr);
        } finally {
            await file.close();
        }
        const chatIndexResponse = await credentials.client().get("");
        const profileLink = new URL(parse(chatIndexResponse.body).querySelector(".topbar-menu-links a")!.getAttribute("href")!, HOST_ADDRESSES[credentials.host]);
        if (profileLink.host == "stackexchange.com") {
            this.logger.info(`Credentials in ${path} are expired!`);
            return null;
        }
        const userId = parseInt(profileLink.pathname.split("/")[2]);
        if (userId != credentials.userId) {
            this.logger.warn(`Credentials in ${path} have an incorrect user ID! (${userId} expected, ${credentials.userId} loaded)`);
            return null;
        }
        return credentials;
    }

    static async loadOrAuthenticate(path: PathLike, email: string, password: string, host: Host) {
        let credentials: Credentials | null = null;
        try {
            credentials = await Credentials.load(path);
        } catch (e) {
            this.logger.warn(`Failed to load credentials from ${path}: ${e}`);
        }
        if (credentials != null) {
            return credentials;
        }
        credentials = await Credentials.authenticate(email, password, host);
        await credentials.save(path);
        return credentials;
    }
}