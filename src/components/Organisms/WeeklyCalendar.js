"use client";

export default function WeeklyCalendar({ schedule }) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Group by day
    const groupedSchedule = days.reduce((acc, day) => {
        acc[day] = schedule.filter(s => s.dayOfWeek === day);
        return acc;
    }, {});

    return (
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
            <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">Weekly Schedule</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-bordered mb-0 border-light text-center">
                        <thead className="bg-light">
                            <tr>
                                {days.map(day => (
                                    <th key={day} className="py-3 px-2 border-light small fw-bold text-uppercase text-muted" style={{ width: "14.28%" }}>
                                        {day.substring(0, 3)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {days.map(day => (
                                    <td key={day} className="p-2 align-top border-light" style={{ minHeight: "200px" }}>
                                        {groupedSchedule[day].length > 0 ? (
                                            groupedSchedule[day].map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 mb-2 rounded shadow-sm text-start"
                                                    style={{
                                                        backgroundColor: "rgba(13, 110, 253, 0.05)",
                                                        borderLeft: "3px solid #0d6efd",
                                                        fontSize: "0.75rem"
                                                    }}
                                                >
                                                    <div className="fw-bold text-dark">{item.startTime} - {item.endTime}</div>
                                                    <div className="text-muted">{item.subjectRef?.name}</div>
                                                    <div className="fw-bold text-primary">{item.classRef?.name}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-muted small">No classes</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
