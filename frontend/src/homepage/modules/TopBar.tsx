import { Link } from 'react-router';
import mike from '../../mike.svg';

export function TopBar() {
    const containerClassName = "flex items-center justify-between bg-app-panel px-4 py-2 text-app-text";
    const leftClassName = "flex items-center gap-2";
    const iconSrc = mike;
    const iconAlt = "JOHN icon";
    const iconClassName = "w-6 h-6";
    const brandClassName = "text-lg font-semibold";
    const brandText = "JOHN";
    const enterAppTo = "/app";
    const enterAppLabel = "Enter App";
    const enterAppClassName = "rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover";

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
