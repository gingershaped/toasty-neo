export default async function UserDetailsLoading() {
    return <div className="mt-4 text-center w-100">
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;
}