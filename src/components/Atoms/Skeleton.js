export default function Skeleton({ width, height, borderRadius, className = "" }) {
    return (
        <div
            className={`skeleton-loader ${className}`}
            style={{
                width: width || "100%",
                height: height || "20px",
                borderRadius: borderRadius || "8px",
            }}
        ></div>
    );
}
