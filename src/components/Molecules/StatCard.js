const StatCard = ({ title, value, icon, bgColor, trend }) => {
  return (
    <div
      className={`card border-0 shadow-sm ${bgColor} text-white mb-3`}
      style={{ borderRadius: "15px" }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between">
          <div>
            <p
              className="mb-1 opacity-75 fw-bold text-uppercase"
              style={{ fontSize: "0.75rem" }}
            >
              {title}
            </p>
            <h2 className="mb-0 fw-bold">{value}</h2>
          </div>
          <div
            className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <i className={`bi ${icon} fs-2`}></i>
          </div>
        </div>
        <div className="mt-3 small">
          <span className="badge bg-white bg-opacity-25 me-1 text-white">
            <i className="bi bi-graph-up-arrow me-1"></i> {trend}
          </span>
          <span>Since last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
