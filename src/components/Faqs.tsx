import { useState } from "react";

type AccordionItem = {
    id: number;
    count: string;
    question: string;
    answer: string;
};

const accordionData: AccordionItem[] = [
    {
        id: 1,
        count: "01",
        question: "What file formats are supported?",
        answer: "Currently, we support PDF files only. Our Docling parser is optimized to handle various PDF structures, including scanned documents, multi-column layouts, and complex formatting commonly found in RFP documents."
    },
    {
        id: 2,
        count: "02",
        question: "How accurate is the AI extraction?",
        answer: "Our AI-powered extraction system achieves over 95% accuracy on standard RFP documents. The system uses advanced LLMs trained specifically on RFP formats to ensure high precision in extracting Summary, PQ, TQ, BOQ, and Payment Terms sections."
    },
   
    {
        id: 3,
        count: "03",
        question: "Is my data secure and private?",
        answer: "Yes, we take data security seriously. All uploaded files are encrypted in transit and at rest. Your documents are processed securely and are automatically deleted from our servers after 24 hours. We never share your data with third parties."
    },
    {
        id: 4,
        count: "04",
        question: "How long does the processing take?",
        answer: "Processing time typically ranges from 30 seconds to 2 minutes, depending on the size and complexity of your RFP document. Most standard RFPs are processed in under 60 seconds."
    },
    {
        id: 5,
        count: "05",
        question: "which sections are extracted to Excel",
        answer: "We extract five key sections: Summary (executive overview), PQ (Pre-Qualification criteria), TQ (Technical Qualification requirements), BOQ (Bill of Quantities), and Payment Terms. Each section is organized into a separate sheet in the Excel file for easy navigation and analysis."
    }
];

export function Accordion() {
    const [openId, setOpenId] = useState<number>(accordionData[0].id);

    const toggleAccordion = (id: number) => {
        // Always keep one open: clicking any header opens that item
        setOpenId(id);
    };

    return (
        <div className="w-full">
            <h2 className="text-[24px] md:text-[32px] lg:text-[36px] font-bold text-center mb-6">
                Frequently Asked Questions
            </h2>

            <div className="w-full bg-[#F6FAFB] py-10">
                <div className="max-w-2xl mx-auto">
                    <div className="space-y-6 border-gray-200">
                        {accordionData.map((item) => (
                            <div
                                key={item.id}
                                className="border-2 border-gray-700 rounded-lg shadow-sm bg-white/5 overflow-hidden"
                            >
                                <div>
                                    <button
                                        onClick={() => toggleAccordion(item.id)}
                                        className="w-full flex justify-between  relative border-blue-300 items-center  text-left font-medium focus:outline-none"
                                    >
                                        <div className="flex gap-5 ps-8">
                                            <span className="font-normal not-italic text-[16px] md:text-[20px] lg:text-[24px] leading-[100%] tracking-[0]" style={{ fontFamily: 'Arial, sans-serif' }}>{item.count}</span>
                                            <span className="font-normal not-italic text-[16px] md:text-[20px] lg:text-[24px] leading-[120%] tracking-[0]" style={{ fontFamily: 'Arial, sans-serif' }}>{item.question}</span>
                                        </div>
                                        <div className={`text-xl md:text-2xl bg-[#290079] text-white text-center px-5 md:px-5 py-2 md:py-2`}>
                                            <span className="-mt-[3px] block">
                                                {openId === item.id ? "−" : "+"}
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {/* Smooth animation */}
                                <div
                                    className={`transition-all duration-500 ease-in-out overflow-hidden ${openId === item.id ? "max-h-60 md:max-h-40 opacity-100 p-3 md:p-4 pt-0" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <p className="text-black text-sm md:text-base lg:text-lg ps-10 md:ps-16">{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
