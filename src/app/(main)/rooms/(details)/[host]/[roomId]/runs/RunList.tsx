"use client";

import { AntifreezeResult, AntifreezeRun, Host } from "@/lib/generated/prisma/client";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { fetchRuns } from "./actions";
import { LoadingButton } from "@/app/_components/LoadingButton";
import { FETCH_SIZE } from "./constants";
import { TIME_FORMAT } from "@/lib/util";

const RUN_RESULT_BADGES: Record<AntifreezeResult, [string, string]> = {
    "ANTIFREEZED": ["primary", "Antifreezed"],
    "ERROR": ["danger", "Error"],
    "OK": ["success", "OK"],
};

export function RunEntry({ run }: { run: AntifreezeRun }) {
    const [badgeColor, badgeLabel] = RUN_RESULT_BADGES[run.result];
    return <li className="list-group-item">
        <div className="d-flex">
            <span className="me-auto">{dayjs(run.checkedAt).format(TIME_FORMAT)}</span>
            <span className={`badge text-bg-${badgeColor} align-self-baseline`}>{badgeLabel}</span>
        </div>
        <div className="form-text">
            {run.result === "ERROR" ? (
                <><span className="text-danger">An error occured:&nbsp;</span>{run.error ?? "lp0 on fire"}</>
            ) : (
                <span>Most recent message sent {run.lastMessage !== null ? dayjs(run.lastMessage).format(TIME_FORMAT) : "at the dawn of time"}</span>
            )}
        </div>
    </li>;
}

export function RunList({ initialRuns, host, roomId }: { initialRuns: AntifreezeRun[], host: Host, roomId: number }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [runs, setRuns] = useState<AntifreezeRun[]>(initialRuns);
    const [hasMore, setHasMore] = useState<boolean>(initialRuns.length >= FETCH_SIZE);

    const loadMore = useCallback(async() => {
        setLoading(true);
        const newRuns = await fetchRuns(host, roomId, runs.at(-1)!.id).finally(() => setLoading(false));
        setRuns([...runs, ...newRuns]);
        setHasMore(newRuns.length >= FETCH_SIZE);
    }, [runs, host, roomId]);

    return <>
        <ul className="list-group mt-1">
            {runs.map((run) => <RunEntry key={run.id} run={run} />)}
        </ul>
        {hasMore && <div className="vstack">
            <LoadingButton
                loading={loading}
                variant="primary"
                onClick={loadMore}
                className="align-self-center mt-3"
            >
                Load more runs
            </LoadingButton>
        </div>}
    </>;
}