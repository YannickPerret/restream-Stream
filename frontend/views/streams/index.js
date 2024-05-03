
export default function StreamPageIndex ({streams}) {
    return (
        <div>
            <h1>Your streams</h1>
            <table>
                <thead>
                <tr>
                    <th>Status</th>
                    <th>Pid</th>
                    <th>Name</th>
                    <th>Start Time</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map(stream => (
                    <tr key={stream.id}>
                        <td>{stream.status}</td>
                        <td>{stream.pid}</td>
                        <td>{stream.name}</td>
                        <td>{stream.startTime}</td>
                        <td>
                            <button>Stop</button>
                            <button>Restart</button>
                            <button>Remove</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}