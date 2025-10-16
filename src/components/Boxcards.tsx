export function BoxCards() {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-[96%] lg:w-[1092px] mx-auto pb-2 md:pb-6">
                <div className="bg-[#9479E21A] px-4 pb-4 rounded-md mt-0 md:mt-2">
                    <div className="flex items-end justify-between">
                        <img src="./box_upload_icon.png" width={100} height={100} alt="star" className="w-4 pb-3" />
                        <h3 className="text-[50px] md:text-[65px] lg:text-[70px] font-[700] text-[#290079] leading-20">1</h3>
                    </div>
                    <div>
                        <h3 className="text-[18px] font-[400]">Upload RFP PDF</h3>
                        <p className="text-[16px] font-[400]">Simply drag and drop your RFP document. Docling parses the structure and content automatically.</p>
                    </div>
                </div>
                <div className="bg-[#9479E233] px-4 pb-4 rounded-md mt-0 md:mb-2">
                    <div className="flex items-end justify-between">
                        <img src="./star_icon.png" width={100} height={100} alt="star" className="w-4 pb-3" />
                        <h3 className="text-[50px] md:text-[65px] lg:text-[70px] font-[700] text-[#290079] leading-20">2</h3>
                    </div>
                    <div>
                        <h3 className="text-[18px] font-[400]">AI Extracts Sections</h3>
                        <p className="text-[16px] font-[400]">Our LLM processes and extracts Summary, PQ, TQ, BOQ, and Payment Terms with high accuracy.</p>
                    </div>
                </div>
                <div className="bg-[#9479E21A] px-4 pb-4 rounded-md mt-0 md:mt-2">
                    <div className="flex items-end justify-between">
                        <img src="./download.png" width={100} height={100} alt="star" className="w-5 pb-3" />
                        <h3 className="text-[50px] md:text-[65px] lg:text-[70px] font-[700] text-[#290079] leading-20">3</h3>
                    </div>
                    <div>
                        <h3 className="text-[18px] font-[400]">Download Excel</h3>
                        <p className="text-[16px] font-[400]">Get a structured Excel file with separate sheets for each section, ready for analysis.</p>
                    </div>
                </div>
            </div>
           <div>
           </div>
        </div>

        
    )
}