import React, { useState } from "react";
import type { DocumentMetadata, ResourceViewMode } from "../lib/types";
import { FaList, FaThLarge } from "react-icons/fa";

interface Props {
	documents: DocumentMetadata[];
}

export default function ResourceList({ documents }: Props) {
	const [viewMode, setViewMode] = useState<ResourceViewMode>({
		mode: "gallery",
		showTranslations: false,
	});
	const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

	const allKeywords = Array.from(
		new Set(documents.flatMap((doc) => doc.keywords))
	).sort();

	const filteredDocuments = documents.filter(
		(doc) =>
			selectedKeywords.length === 0 ||
			doc.keywords.some((keyword) => selectedKeywords.includes(keyword))
	);

	return (
		<div className='container mx-auto px-4 mt-4'>
			<div className='mb-6 flex justify-between items-center'>
				<div className='flex gap-4 relative'>
					<button
						onClick={() => setViewMode({ ...viewMode, mode: "gallery" })}
						className={`p-2 ${
							viewMode.mode === "gallery" ? "text-[#3C2A21]" : "text-gray-600"
						}`}
					>
						<FaThLarge />
					</button>
					<button
						onClick={() => setViewMode({ ...viewMode, mode: "list" })}
						className={`p-2 ${
							viewMode.mode === "list" ? "text-[#3C2A21]" : "text-gray-600"
						}`}
					>
						<FaList />
					</button>
				</div>
				{/* <div className='relative'>
					<label className='flex items-center gap-2'>
						<input
							type='checkbox'
							checked={viewMode.showTranslations}
							onChange={(e) =>
								setViewMode({ ...viewMode, showTranslations: e.target.checked })
							}
						/>
						Pokaż tłumaczenia
					</label>
				</div> */}
			</div>

			<div className='mb-6'>
				<h3 className='text-lg font-semibold mb-2 text-[#3C2A21]'>
					Filtruj według słów kluczowych:
				</h3>
				<div className='flex flex-wrap gap-2 relative'>
					{allKeywords.map((keyword) => (
						<button
							key={keyword}
							onClick={() =>
								setSelectedKeywords((prev) =>
									prev.includes(keyword)
										? prev.filter((k) => k !== keyword)
										: [...prev, keyword]
								)
							}
							className={`px-3 py-1 rounded-full ${
								selectedKeywords.includes(keyword)
									? "bg-[#3C2A21] text-white"
									: "bg-[#D5CEA3]"
							}`}
						>
							{keyword}
						</button>
					))}
				</div>
			</div>

			<div
				className={
					viewMode.mode === "gallery"
						? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
						: "space-y-4"
				}
			>
				{filteredDocuments.map((doc) => (
					<div
						key={`${doc.recordId}-${doc.pageNumber}`}
						className={`relative border border-[#D5CEA3] rounded-lg p-4 shadow-xl bg-[#F8F5F2] ${
							viewMode.showTranslations ? "flex gap-4" : ""
						}`}
						style={{ backgroundColor: "#F8F5F2" }}
					>
						{/* This is gallery view and remember to modify labels in list view too */}
						{viewMode.mode === "gallery" && (
							<div className={viewMode.showTranslations ? "w-1/2" : "w-full"}>
								<a href={`/zasoby/${doc.recordId}/${doc.pageNumber}`}>
									<p className='text-sm mb-2'>
										<strong>Słowa kluczowe:</strong> {doc.keywords.join(", ")}
									</p>
									<hr />
									<img
										src={`/thumbnails/${doc.recordId}.jpg`}
										alt={`Strona ${doc.pageNumber} z ${doc.newspaperTitle}`}
										className='w-1/2 h-1/2 mx-auto object-cover mb-4 mt-4 bg-[#b5a896] border-2 border-gray-500 rounded-md'
									/>
									<hr />
									<h3 className='mt-2 '>
										<strong>Źródło:</strong> {doc.newspaperTitle}
									</h3>
									<p className='text-sm'>
										<strong>Rok:</strong> {doc.year}, <strong>Strona:</strong>{" "}
										{doc.pageNumber}
									</p>
								</a>
							</div>
						)}
						{/* This is list view and remember to modify labels in list view too */}
						{viewMode.mode === "list" && (
							<div className={viewMode.showTranslations ? "w-1/2" : "w-full"}>
								<a
									href={`/zasoby/${doc.recordId}/${doc.pageNumber}`}
									className='flex gap-4 items-start'
								>
									<img
										src={`/thumbnails/${doc.recordId}.jpg`}
										alt={`Strona ${doc.pageNumber} z ${doc.newspaperTitle}`}
										className='w-[5%] h-auto object-cover bg-[#b5a896] border-2 border-gray-500 rounded-md'
									/>
									<div className='flex-1'>
										<p className='text-sm mb-2'>
											<strong>Słowa kluczowe:</strong> {doc.keywords.join(", ")}
										</p>
										<hr />
										<h3 className='mt-2'>
											<strong>Źródło:</strong> {doc.newspaperTitle}
										</h3>
										<p className='text-sm'>
											<strong>Rok:</strong> {doc.year}, <strong>Strona:</strong>{" "}
											{doc.pageNumber}
										</p>
									</div>
								</a>
							</div>
						)}
						{viewMode.showTranslations && (
							<div className='w-1/2'>
								{doc.translations.map((translation, index) => (
									<div key={index} className='bg-[#F5F5DC] p-3 rounded mb-2'>
										<p className='text-sm font-semibold mb-1 text-[#3C2A21]'>
											Słowo kluczowe: {translation.keyword}
										</p>
										<p className='text-sm'>{translation.translatedText}</p>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
