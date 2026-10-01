import { Link } from 'react-router';

export function TopBar() {
    const containerClassName = "flex items-center justify-between bg-gray-900 px-4 py-2 text-white";
    const leftClassName = "flex items-center gap-2";
    const iconSrc = "https://raw.githubusercontent.com/wietyy/john/main/frontend/src/mike.svg";
    const iconAlt = "JOHN icon";
    const iconClassName = "w-6 h-6";
    const brandClassName = "text-lg font-semibold";
    const brandText = "JOHN";
    const enterAppTo = "/app";
    const enterAppLabel = "Enter App";
    const enterAppClassName = "rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600";

    return (
        <div className={containerClassName}>
            <div className={leftClassName}>
                <img src={iconSrc} alt={iconAlt} className={iconClassName} />
                <span className={brandClassName}>{brandText}</span>
            </div>
            <Link to={enterAppTo} className={enterAppClassName}>
                {enterAppLabel}
            </Link>
        </div>
    );
}
