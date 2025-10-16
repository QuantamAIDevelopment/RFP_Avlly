export function Hero() {
    return (
        <div className="bg-[#F6FAFB] pt-0 md:pt-2 lg:pt-6 pb-4 md:pb-8 lg:pb-10">
            <div className="w-full p-4 border-gray-200 flex justify-end items-end">
                <div className="w-[75%] md:w-[75%] lg:w-[62%]">
                    <h2 className="text-[10px] md:text-[20px] lg:text-[25.6px] ms-1 font-semibold">Hello</h2>
                    <div className="flex items-end gap-x-4">
                        <p className="text-[26px] md:text-[66px] lg:text-[86.8px] font-semibold leading-7 md:leading-16 lg:leading-20">
                            Parse<br />
                            RFPs in<br />
                            Minutes
                        </p>
                        <p className="text-gray-500 text-[8px] md:text-[14px] lg:text-[16px] pb-2">
                            Upload your RFP PDF and instantly extract Summary, PQ, TQ, BOQ, and Payment Terms into a structured Excel report.
                        </p>
                    </div>
                </div>
            </div>
            <div className="-mt-[50px] md:-mt-[80px] lg:-mt-[120px]">
                <div className="flex justify-center items-center">
                    <div>
                        <img src="./hero_bg_left.png" width={100} height={100} alt="hero" className="w-full h-full" />
                    </div>
                    <div>
                        <img src="./hero_bg_right.png" width={100} height={100} alt="hero" className="w-full h-full" />
                    </div>
                </div>
            </div>
        </div>

    )
}