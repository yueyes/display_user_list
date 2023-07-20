import { useEffect, useMemo, useState } from 'react';
import { IDisplayUsers } from '../App';

interface IPaginationParams {
    dataPerPage: number;
    data: IDisplayUsers[];
    startFrom: number;
    isAppliedFilter: boolean;
}

interface IPagination {
    page: number;
    current: boolean;
    ellipsis: boolean;
}

export const usePagination = ({ dataPerPage, data, startFrom, isAppliedFilter }: IPaginationParams) => {
    console.log(JSON.stringify(data));
    const pages = Math.ceil(data.length / dataPerPage);
    const [currentPage, setCurrentPage] = useState(startFrom <= pages ? startFrom : 1);
    const [paginatedData, setPaginatedData] = useState([...data].slice((currentPage - 1) * dataPerPage, currentPage * dataPerPage));
    console.log(`pages : ${pages} , startFrom : ${startFrom}, currentPage : ${currentPage}`);


    useEffect(() => {
        console.log("data : ", data);
        if (data.length > 0) {
            setPaginatedData([...data].slice((currentPage - 1) * dataPerPage, currentPage * dataPerPage));
        }
    }, [data])

    useEffect(() => {
        console.log('a : ', startFrom);
        console.log('pages : ', pages)
        setCurrentPage(startFrom <= pages ? startFrom : 1);
    }, [startFrom, pages])

    const pagination = useMemo(() => {
        let ellipsisLeft = false;
        let ellipsisRight = false;
        console.log(currentPage);

        return Array.from(Array(pages).keys()).reduce<IPagination[]>((accu, current, currentIndex) => {
            const loopThroughPage = currentIndex + 1;
            if (loopThroughPage === currentPage) {
                return [...accu, { page: currentPage, current: true, ellipsis: false }]
            }
            // last page || previous page || next page
            else if (loopThroughPage > pages - 1 || loopThroughPage === currentPage - 1 || loopThroughPage === currentPage + 1) {
                return [...accu, { page: loopThroughPage, current: false, ellipsis: false }]
            }
            // 2 - currentPage // !ellipsisLeft?
            else if (loopThroughPage > 1 && loopThroughPage < currentPage && !ellipsisLeft) {
                ellipsisLeft = true;
                return [...accu, { page: loopThroughPage, current: false, ellipsis: true }]
            }
            // currentPage, currentPage + 1, ... pages
            else if (loopThroughPage < pages && loopThroughPage > currentPage && !ellipsisRight) {
                ellipsisRight = true;
                return [...accu, { page: loopThroughPage, current: false, ellipsis: true }]
            }
            return accu;
        }, [])
    }, [currentPage, data, dataPerPage])

    // console.log("pagin", pagination);

    const changePage = (page: number, e: any) => {
        e.preventDefault();
        if (page !== currentPage) {
            setCurrentPage(page);
            setPaginatedData([...data].slice((page - 1) * dataPerPage, page * dataPerPage))
        }
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const goPreviousPage = (e: any) => {
        e.preventDefault();
        setCurrentPage((prev) => prev - 1 === 0 ? prev : prev - 1);
        if (currentPage !== 1) {
            setPaginatedData([...data].slice((currentPage - 2) * dataPerPage, (currentPage - 1) * dataPerPage));
        }
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const goNextPage = (e: any) => {
        e.preventDefault();
        setCurrentPage((prev) => prev === pages ? prev : prev + 1);
        // if (currentPage !== 1) {
        setPaginatedData([...data].slice(currentPage * dataPerPage, (currentPage + 1) * dataPerPage));
        // }
        window.scrollTo({ top: 0, behavior: "smooth" })
    }


    return { paginatedData, pagination, currentPage, pages, goNextPage, goPreviousPage, changePage }
}