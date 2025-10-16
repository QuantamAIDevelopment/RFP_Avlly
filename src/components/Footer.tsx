import { div } from "framer-motion/client"

export function Footer() {
    return (
        
        <div className="p-6 md:p-8 lg:p-10 shadow-xs flex flex-col gap-3 md:gap-4 lg:gap-6">
            <div className="w-[95%] md:w-[90%] max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 lg:gap-6">
                <img src="./allvy_logo.png" width={100} height={100} alt="logo" className="w-20 md:w-28 lg:w-40 h-auto" />
                <p className="text-center md:text-left text-[13px] md:text-[14px] lg:text-[16px] leading-[20px] md:leading-[22px] lg:leading-[24px]">
                    Transforming RFP documents into structured data with AI-powered extraction.
                </p>
            </div>
            <p
  className="text-center md:text-left w-[95%] md:w-[90%] max-w-6xl mx-auto font-normal text-[12px] md:text-[13px] lg:text-[14px] leading-[18px] md:leading-[20px] lg:leading-[22px] tracking-[0]"
  style={{ fontFamily: 'Arial, sans-serif', color: '#717182ad' }} >
  © 2025 ALLVY Software Pvt Ltd. All rights reserved.
            </p>
        </div>
    )
}