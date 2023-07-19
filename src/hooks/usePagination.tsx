import { useEffect, useState } from 'react';
import { IUsers } from '../services/UserServices';

interface IPaginationParams {
    dataPerPage: number;
    data: IUsers[];
    startFrom: number;
}

interface IPagination {
    page: number;
    current: boolean;
    ellipsis: boolean;
}

export const usePagination = ({ dataPerPage, data, startFrom }: IPaginationParams) => {
    // console.log(JSON.stringify(data));
    const pages = Math.ceil(data.length / dataPerPage);
    const [currentPage, setCurrentPage] = useState(startFrom <= pages ? startFrom : 1);
    const [paginatedData, setPaginatedData] = useState([...data].slice((currentPage - 1) * dataPerPage, currentPage * dataPerPage));
    let ellipsisLeft = false;
    let ellipsisRight = false;
    console.log(`pages : ${pages} , startFrom : ${startFrom}, currentPage : ${currentPage}`);

    useEffect(() => {
        if (data.length > 0) {
            setPaginatedData([...data].slice((currentPage - 1) * dataPerPage, currentPage * dataPerPage));
        }
    }, [data])

    useEffect(() => {
        console.log('a : ', startFrom);
        setCurrentPage(startFrom <= pages ? startFrom : 1);
    }, [startFrom])

    const pagination = Array.from(Array(pages).keys()).reduce<IPagination[]>((accu, current, currentIndex) => {
        const loopThroughPage = currentIndex + 1;
        if (loopThroughPage === currentPage) {
            return [...accu, { page: currentPage, current: true, ellipsis: false }]
        }
        // last page || previous page || next page
        else if (loopThroughPage > pages - 1 || loopThroughPage === currentPage - 1 || loopThroughPage === currentPage + 1) {
            return [...accu, { page: loopThroughPage, current: false, ellipsis: false }]
        }
        // 2 - currentPage // !ellipsisLeft?
        else if (loopThroughPage > 1 && loopThroughPage < currentPage) {
            if (accu[currentIndex - 1].ellipsis) {
                return accu;
            }
            return [...accu, { page: loopThroughPage, current: false, ellipsis: true }]
        }
        // currentPage, currentPage + 1, ... pages
        else if (loopThroughPage < pages && loopThroughPage > currentPage) {
            console.log('current :', currentIndex - 1);
            if (accu[currentIndex - 1]?.ellipsis) {
                return accu;
            }
            return [...accu, { page: loopThroughPage, current: false, ellipsis: true }]
        }
        return accu;
    }, [])

    console.log("pagin", pagination);

    const changePage = (page: number, e: any) => {
        e.preventDefault();
        if (page !== currentPage) {
            setCurrentPage(page);
            setPaginatedData([...data].slice((page - 1) * dataPerPage, page * dataPerPage))
        }
    }

    const goPreviousPage = (e: any) => {
        e.preventDefault();
        setCurrentPage((prev) => prev - 1 === 0 ? prev : prev - 1);
        if (currentPage !== 1) {
            setPaginatedData([...data].slice((currentPage - 2) * dataPerPage, (currentPage - 1) * dataPerPage));
        }
    }

    const goNextPage = (e: any) => {
        e.preventDefault();
        setCurrentPage((prev) => prev === pages ? prev : prev + 1);
        if (currentPage !== 1) {
            setPaginatedData([...data].slice(currentPage * dataPerPage, (currentPage + 1) * dataPerPage));
        }
    }


    return { paginatedData, pagination, currentPage, pages, goNextPage, goPreviousPage, changePage }
}