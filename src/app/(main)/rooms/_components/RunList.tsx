import { AntifreezeResult, AntifreezeRun } from "@prisma/client";
import dayjs from "dayjs";

const RUN_RESULT_BADGES: Record<AntifreezeResult, [string, string]> = {
    "ANTIFREEZED": ["primary", "Antifreezed"],
    "ERROR": ["danger", "Error"],
    "OK": ["success", "OK"],
};

export function RunEntry({ run }: { run: AntifreezeRun }) {
    const [badgeColor, badgeLabel] = RUN_RESULT_BADGES[run.result];
    return <li className="list-group-item">
        <div className="d-flex">
            <span className="me-auto">{dayjs(run.checkedAt).toISOString()}</span>
            <span className={`badge text-bg-${badgeColor} align-self-baseline`}>{badgeLabel}</span>
        </div>
        <div className="form-text">
            {run.result == "ERROR" ? (
                <><span className="text-danger">An error occured:&nbsp;</span>{run.error!}</>
            ) : (
                <span>Most recent message sent at {dayjs(run.mostRecentMessage!).toISOString()}</span>
            )}
        </div>
    </li>;
}

export function RunList({ runs }: { runs: AntifreezeRun[] }) {
    return <ul className="list-group mt-1">
        {runs.map((run) => <RunEntry key={run.id} run={run} />)}
    </ul>;
}