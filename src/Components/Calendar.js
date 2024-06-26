import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/theme/default.css';
import 'react-date-range/dist/styles.css';
import '../style/calendar.css'
import useBlackoutDates from '../api/blackoutdates'; 

export default function Calendar({ dateRange, setDateRange, listingId, datesBooked, onDisabledDatesChange = () => {} }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { blackoutDates } = useBlackoutDates(listingId); 

    const [disabledDates, setDisabledDates] = useState([]);

    const handleDateRangeChange = (ranges) => {
        setDateRange([ranges.selection]);
    };

    useEffect(() => {
        const convertToDisabledDates = () => {
            const convertedDates = blackoutDates.flatMap((range) => {
                const startDate = new Date(range.start_date);
                const endDate = new Date(range.end_date);
                const dates = [];
                let currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    dates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                return dates;
            });

            let uniqueDatesWithoutBooked = convertedDates;

            if (datesBooked && datesBooked.start_date && datesBooked.end_date) {
                const bookedStartDate = new Date(datesBooked.start_date);
                const bookedEndDate = new Date(datesBooked.end_date);
                const bookedDates = [];
                let currentBookedDate = new Date(bookedStartDate);

                while (currentBookedDate <= bookedEndDate) {
                    bookedDates.push(new Date(currentBookedDate));
                    currentBookedDate.setDate(currentBookedDate.getDate() + 1);
                }

                const uniqueDates = [...new Set([...convertedDates, ...bookedDates])];
                uniqueDatesWithoutBooked = uniqueDates.filter(date => {
                    const currentDate = new Date(date);
                    const startDate = new Date(datesBooked.start_date);
                    const endDate = new Date(datesBooked.end_date);

                    return !(currentDate >= startDate && currentDate <= endDate);
                });
            }

            setDisabledDates(uniqueDatesWithoutBooked);
        };

        convertToDisabledDates();
        onDisabledDatesChange(disabledDates);
        
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };


    }, [blackoutDates, datesBooked]);

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1)


    return (
        <div className="rounded-wrapper">
            <DateRange
                className="rounded-date-range"
                editableDateInputs={true}
                onChange={handleDateRangeChange}
                months={windowWidth <= 950 ? 1 : 2} 
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                showDateDisplay={false}
                minDate={nextDay}
                disabledDates={disabledDates}
                direction="horizontal"
            />
        </div>
    );
}
