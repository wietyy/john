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
                <div className="p-3 bg-gray-800">
                    <p className="text-white italic grid place-items-center">JOHN is available on GitHub free for personal and commercial use under the MIT License. Copyright © 2026 Caleb Wietholter</p>
                </div>
            </div>
        </>
    )
}