import React, { useState } from "react";
import { apiService } from "./service/Api";
import { fileUploadHandler } from "./service/folder";

export function RFPsAiSection() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0] || null;
        if (!uploadedFile) return;

        // Reset prior state
        setError(null);
        setDownloadUrl(null);
        setDownloadName(null);
        setProgress(0);
        setFile(uploadedFile);
        
        await fileUploadHandler.uploadAndProcessFile(uploadedFile, {
            onProgress: (p) => {
                const clamped = Math.max(0, Math.min(100, Math.round(p)));
                setProgress(clamped);
            },
            onError: (err) => {
                setError(err);
            },
            onSuccess: (res) => {
                setProgress(100);
                setDownloadUrl(res.downloadUrl || null);
                setDownloadName(res.filename || null);
                // Do not auto-download; show the Download button
            },
        });
    };

    // Handle file download
    const handleDownload = () => {
        if (downloadUrl) {
            apiService.downloadFile(downloadUrl, downloadName || "rfp_analysis.xlsx");
        }
    };

    return (
        <div className="py-10 px-2">
            <div className="w-[95%] md:w-[75%] lg:w-[896px] mx-auto">
                <h4 className="flex items-center gap-2 font-medium text-[16px] text-[#4E1BB6] justify-center">
                    <img src="./Vector.png" width={100} height={100} alt="logo" className="w-[14px] h-[14px]" />
                    RFPs AI
                </h4>
                <div className="text-center mt-3 space-y-2">
                    <h2 className="font-[700] text-[24px] md:text-[24px] lg:text-[36px] leading-7">
                        Transform RFPs into Structured Insights Instantly
                    </h2>
                    <p className="font-[500] text-[15px] md:text-[14px] lg:text-[18px]">
                        Upload your RFP PDF, let our AI parse and extract key sections — Summary, PQ, TQ, BOQ, and Payment Terms — and download everything neatly organized in a single Excel file with separate sheets.
                    </p>
                </div>
            </div>

            <div className="flex justify-center items-center mt-4 md:mt-8">
                <div className="relative flex justify-center items-center">
                    <img
                        src="./bgfile.png"
                        width={100}
                        height={100}
                        alt="bgfile"
                        className="w-[96%] md:w-[90%] lg:w-[1140px] lg:h-[640px] rounded-md"
                    />
                    <div className="absolute w-[250px] md:w-[500px] lg:w-[846px] h-[180px] md:h-[328.69px] border border-gray-100 shadow-md rounded-[12px] flex justify-center items-center">
                        <div className="flex justify-center flex-col items-center text-white text-center">
                            <button className="w-[35px] h-[35px] md:w-[67.82px] md:h-[67.82px] rounded-full p-2 md:p-4 btn-gd">
                                <img src="./upload_Icon.png" width={100} height={100} alt="upload" />
                            </button>
                            <div className="mt-4 font-[400]">
                                <p className="text-[14px] md:text-[19.07px]">
                                    {file ? (error ? "Upload failed" : (downloadUrl ? "Ready to download" : "Processing...")) : "Drop your RFP PDF here"}
                                </p>
                                <p className="text-[12px] md:text-[16.95px]">
                                    {file ? (error ? error : (downloadName || file.name)) : "or click to browse your files"}
                                </p>
                            </div>

                            {/* Button Section */}
                            {/* Always keep the input available so users can retry immediately */}
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="fileInput"
                            />
                            {!file ? (
                                <label
                                    htmlFor="fileInput"
                                    className="cursor-pointer text-sm md:text-base w-[150px] h-[36px] md:w-[174px] md:h-[54px] rounded-[12px] flex gap-2 justify-center items-center font-semibold bg-white text-black mt-3"
                                >
                                    Upload PDF
                                    <img
                                        src="./Icon_upload_black.png"
                                        width={100}
                                        height={100}
                                        alt="upload_Icon"
                                        className="w-[16.95px] h-[16.95px] -mt-1"
                                    />
                                </label>
                            ) : (
                                <>
                                    {error ? (
                                        <label
                                            htmlFor="fileInput"
                                            className="cursor-pointer text-sm md:text-base w-[150px] h-[36px] md:w-[174px] md:h-[54px] rounded-[12px] flex gap-1 justify-center items-center font-semibold bg-white text-black mt-3"
                                            onClick={() => { setError(null); setDownloadUrl(null); setDownloadName(null); setProgress(null); }}
                                        >
                                            Try Again
                                            <img
                                                src="./Icon_upload_black.png"
                                                width={100}
                                                height={100}
                                                alt="retry_upload"
                                                className="w-[16.95px] h-[16.95px] -mt-1"
                                            />
                                        </label>
                                    ) : (!downloadUrl ? (
                                        <div className="flex flex-col items-center mt-3">
                                            <div className="text-sm md:text-base w-[150px] h-[36px] md:w-[174px] md:h-[54px] rounded-[12px] flex gap-2 justify-center items-center font-semibold bg-white text-black">
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                                                Generating...
                                            </div>
                                            <div className="text-xs md:text-sm mt-2 opacity-90">
                                                Processing {typeof progress === 'number' ? `${progress}%` : '...'}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleDownload}
                                            className="text-sm md:text-base w-[150px] h-[36px] md:w-[174px] md:h-[54px] rounded-[12px] flex gap-1 justify-center items-center font-semibold bg-white text-black mt-3"
                                        >
                                            Download Excel
                                            <img
                                                src="./Icon_upload_black.png"
                                                width={100}
                                                height={100}
                                                alt="download_Icon"
                                                className="w-[16.95px] h-[16.95px] -mt-1"
                                            />
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
