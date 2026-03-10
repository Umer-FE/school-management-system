import Skeleton from "../Atoms/Skeleton";

export default function CardSkeleton() {
    return (
        <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex flex-column gap-2">
                    <Skeleton width="100px" height="15px" />
                    <Skeleton width="140px" height="32px" />
                </div>
                <Skeleton width="48px" height="48px" borderRadius="12px" />
            </div>
            <Skeleton width="80px" height="12px" />
        </div>
    );
}
