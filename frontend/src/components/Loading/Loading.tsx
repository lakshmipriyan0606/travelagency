
const Loading = ({ show = true }) => {
    if (!show) return null;
    return (
        <div className="loader-overlay">
            <div className="loader"></div>
        </div>
    );
};

export default Loading;