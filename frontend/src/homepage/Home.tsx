import { TopBar } from "./modules/TopBar";
import { Gyro } from "./modules/Gyro";
import { Description } from "./modules/Desc";

export function Home() {
    return (
        <>
            <div className="w-full min-h-screen bg-gray-900">
                <TopBar />
                <Gyro />
                <Description />
            </div>
        </>
    )
}