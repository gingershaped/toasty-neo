export type RoomEditFormProps = {
    isModerator: boolean,
    message?: string,
    run?: boolean,
    locked?: boolean,
    readOnly?: boolean,
};

export function RoomEditForm({ isModerator, message, run, locked, readOnly }: RoomEditFormProps) {
    return <>
        <div className="mb-3">
            <label htmlFor="room-message" className="form-label">Antifreeze message to send</label>
            <input type="text" className="form-control" id="room-message" name="message" maxLength={128} defaultValue={message ?? "---"} disabled={readOnly} />
            <div className="mt-3">
                Available substitutions:
                <ul className="my-1">
                    <li><code>{"{days}"}</code> - Days since last antifreeze run</li>
                </ul>
                If the message <code>---</code> is used, it will not be shown in the transcript.
            </div>
        </div>
        <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="run-antifreeze" name="active" defaultChecked={run ?? true} disabled={readOnly} />
            <label className="form-check-label" htmlFor="run-antifreeze">Run antifreeze</label>
        </div>
        {isModerator && <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="locked" name="locked" defaultChecked={locked ?? false} disabled={readOnly} />
            <label className="form-check-label" htmlFor="locked">Locked</label>
        </div>}
    </>;
}