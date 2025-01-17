'use client';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { AnimatePresence, motion } from 'framer-motion';
import { viewType } from '@/constants';

const headingDisplay = (currentDate: DateTime, selectedView: viewType) => {
	switch (selectedView) {
		case viewType.year: {
			return currentDate.year;
		}
		case viewType.month: {
			return `${currentDate.monthLong} ${currentDate.year}`;
		}
		case viewType.week: {
			return ` Week-${Math.ceil(currentDate.day / 7)} ${currentDate.monthShort}  ${currentDate.year}`;
		}
		case viewType.day: {
			return `${currentDate.day} ${currentDate.monthLong} ${currentDate.year}`;
		}
		default: {
			return currentDate.year;
		}
	}
};
const generateYearData = () => {
	const startOfYear = DateTime.now().startOf('year');
	const endOfYear = DateTime.now().endOf('year');

	const yearData = [] as DateTime[];
	for (let i = startOfYear; i <= endOfYear; i = i.plus({ days: 1 })) {
		yearData.push(i);
	}
	return yearData;
};
const DotsGrid = ({ data, isMonthView }: { data: DateTime[]; isMonthView: boolean }) => {
	return (
		<motion.div
			className={`grid justify-items-center  gap-3 transition-all ${
				isMonthView
					? 'grid-cols-7 sm:gap-4 sm:pt-8' // 7 columns for a month
					: 'grid-cols-[repeat(16,minmax(0,1fr))] sm:grid-cols-[repeat(26,minmax(0,1fr))] sm:gap-x-2 sm:gap-y-8 sm:pt-6'
			}`}>
			{data.map((date) => (
				<motion.div
					key={date.toISO()} // Unique key
					layout // Enables smooth transitions
					transition={{ type: 'spring', damping: 15, stiffness: 100 }}
					className='group relative cursor-pointer'>
					<div className={`transition-all hover:scale-125 rounded-full bg-white ${isMonthView ? 'size-5 sm:size-6' : 'size-3 sm:size-4'} ${date < DateTime.now().minus({ days: 1 }) ? 'opacity-50' : ''} ${date.hasSame(DateTime.now(), 'day') ? '!bg-red-500 animate-pulse ' : ''}`}></div>
					<motion.div
						animate={{ rotate: 360 }}
						className='hidden group-hover:block absolute z-50 shadow-2xl text-sm bg-zinc-900 text-white rounded left-5 min-w-36 p-2'>
						{date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
					</motion.div>
				</motion.div>
			))}
		</motion.div>
	);
};

export default function Home() {
	const [currentDate, setCurrentDate] = useState<DateTime | null>(null);
	const [yearData, setYearData] = useState<DateTime[]>([]);
	const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
	const [remainingMode, setRemainingMode] = useState<'M1' | 'M2'>('M1');
	const [selectedView, setSelectedView] = useState<viewType>(viewType.year);

	useEffect(() => {
		const now = DateTime.now();
		setYearData(generateYearData());
		setCurrentDate(now);
		setSelectedView(viewType.year);
	}, []);

	const handleDateClick = () => {
		switch (selectedView) {
			case viewType.year: {
				setSelectedView(viewType.month);
				break;
			}
			case viewType.month: {
				setSelectedView(viewType.week);
				break;
			}
			case viewType.week: {
				setSelectedView(viewType.day);
				break;
			}
			case viewType.day: {
				setSelectedView(viewType.year);
				break;
			}
			default: {
				setSelectedView(viewType.year);
			}
		}
		setViewMode((prev) => (prev === 'year' ? 'month' : 'year'));
	};

	const handleRemainingButtonClick = () => {
		setRemainingMode((prev) => (prev === 'M1' ? 'M2' : 'M1'));
	};

	if (!currentDate) return null;

	// Filter data for current month
	// const filteredData = viewMode === 'month' ? yearData.filter((d) => d.hasSame(currentDate, selectedView)) : yearData;
	const filteredData = yearData.filter((d) => d.hasSame(currentDate, selectedView));

	const daysLeft = currentDate.endOf('year').ordinal - currentDate.ordinal;
	const percentageLeft = ((daysLeft / currentDate.endOf('year').ordinal) * 100).toFixed(1);

	return (
		<main className='bg-black h-screen font-mono'>
			<div className='container pt-10 mx-auto bg-black'>
				<AnimatePresence mode='wait'>
					<motion.h1
						key={selectedView}
						transition={{ duration: 0.3 }}
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -10, opacity: 0 }}
						className='pl-2 font-semibold text-zinc-200 text-4xl'>
						{headingDisplay(currentDate, selectedView)}
					</motion.h1>
				</AnimatePresence>
				<DotsGrid
					data={filteredData}
					isMonthView={viewMode === 'month'}
				/>
			</div>
			<div className='absolute w-screen  bottom-10 '>
				<div className='container hover:bg-white hover:bg-opacity-5 py-3 rounded-xl mx-auto flex justify-between items-center text-white px-2'>
					<span
						className='cursor-pointer'
						onClick={handleDateClick}>
						{viewMode === 'year' ? currentDate.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY) : currentDate.toLocaleString({ month: 'long', year: 'numeric' })}
					</span>

					<button
						onClick={handleRemainingButtonClick}
						className='relative min-w-32 text-right'>
						<AnimatePresence mode='wait'>
							<motion.div
								key={remainingMode}
								transition={{ duration: 0.1 }}
								initial={{ y: 10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -10, opacity: 0 }}
								className='absolute inset-0 flex items-center justify-center w-full h-full'>
								{remainingMode === 'M1' ? `${daysLeft} Days left` : `${percentageLeft}% left`}
							</motion.div>
						</AnimatePresence>
					</button>
				</div>
			</div>
		</main>
	);
}
