import Skeleton from "../Atoms/Skeleton";

export default function TableSkeleton({ rows = 5 }) {
    return (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-header bg-white py-3 border-0">
                <Skeleton width="150px" height="24px" />
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3"><Skeleton width="100%" height="20px" /></th>
                                <th className="py-3"><Skeleton width="100%" height="20px" /></th>
                                <th className="py-3"><Skeleton width="100%" height="20px" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(rows)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><Skeleton width="100%" height="20px" /></td>
                                    <td className="py-3"><Skeleton width="100%" height="20px" /></td>
                                    <td className="py-3"><Skeleton width="100%" height="20px" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
