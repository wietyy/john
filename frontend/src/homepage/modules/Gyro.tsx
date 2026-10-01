import gyrobkg from "../gyrobkg.jpg";

export function Gyro() {
    const boxWidth = "w-full";
    const boxHeight = "h-175";
    const boxImage = `url('${gyrobkg}')`;
    const boxBackground = "bg-cover bg-center";
    const boxColor = "bg-gray-800";
    const boxCenter = "flex items-center justify-center";
    const boxClassName = `${boxWidth} ${boxHeight} ${boxBackground} ${boxCenter} ${boxColor}`;

    const centeredDivClassName = "flex flex-col items-center";

    const titleText = "JOHN";
    const titleClassName = "text-[100px] font-bold uppercase text-white";

    const descriptionText = "An incredibly badass way to keep track of your finances.";
    const descriptionClassName = "text-[17px] italic text-white";

    return (
        <div className={boxClassName} style={{ backgroundImage: boxImage }}>
            <div className={centeredDivClassName}>
                <h1 className={titleClassName}>{titleText}</h1>
                <p className={descriptionClassName}>{descriptionText}</p>
            </div>
        </div>
    )
}