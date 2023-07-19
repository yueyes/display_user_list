import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { usePagination } from './hooks/usePagination';
import { getUserList, IUsers } from './services/UserServices';
import styles from './styles/table.module.scss';
import paginatorStyles from './styles/paginator.module.scss';

const tableHeaders = ["Id", "Name", "Username", "Email", "Address", "Phone", "Website", "Company"]

export interface IDisplayUsers extends Omit<IUsers,"address">{
  address : JSX.Element;
}

function App() {
  const [userList, setUserList] = useState<IDisplayUsers[]>([])
  const [loading, setLoading] = useState(false);
  const [dataPerPage, setDataPerPage] = useState(3);
  const { paginatedData, pagination, currentPage, pages: totalPages, goNextPage, goPreviousPage, changePage } = usePagination({ dataPerPage, data: userList, startFrom: 5 });
  // console.log(paginatedData);
  // console.log(pagination);
  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUserList();
      setUserList(data.map((dat)=>{
        return{
          ...dat,
          address : <>{dat.address.suite}, {dat.address.street}, {dat.address.city}, {dat.address.zipcode}(<a className={styles.addressLatLngLink} href={`https://maps.google.com/?q=${dat.address.geo.lat},${dat.address.geo.lng}}`}>{`${dat.address.geo.lat},${dat.address.geo.lng}`}</a>)</>
        }
      }));
    } catch (err) {
      console.debug(err);
    } finally {//https://maps.google.com/?q=
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    getUser();
  }, [])

  return (
    <div className="App" style={{overflowX:"auto"}}>
      <div><h1 style={{color : "#FFF"}}>User list</h1></div>
      <table className={styles.userInfo}>
        <thead className={styles.userTableHeader}>
          <tr>
            {tableHeaders.map((field) => <th>{field}</th>)}
          </tr>
        </thead>
        <tbody className={styles.userTableRow}>
          {paginatedData.map((userInfo) => {
            return (
              <tr key={userInfo.id}>
                {Object.keys(userInfo).map((field) => {
                  let value = userInfo[field];
                  if (typeof value === "object" && field !== "address") {
                    value = JSON.stringify(value);
                  }
                  if(field === "company"){
                    const {name,catchPhrase,bs} = JSON.parse(value);
                    console.log(name);
                    return (<td key={userInfo.id + "_" + field}><div>{`${name} --- ${bs}`}</div><div className={styles.companyCatchPhrase}>"{catchPhrase}"</div></td>)
                  }
                  return (<td key={userInfo.id + "_" + field}>{value}</td>)
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className={paginatorStyles.paginator}>
        {currentPage > 1 &&
          <span onClick={goPreviousPage} className={paginatorStyles.paginator_item}>prev</span>
        }
        {pagination.map((paginate) => {
          return (
            <>
              {paginate.ellipsis && <span className={paginatorStyles.paginator_ellipsis}>...</span>}
              {!paginate.ellipsis && <span onClick={(e)=>changePage(paginate.page,e)} className={`${paginatorStyles.paginator_item}${paginate.current ? ` ${paginatorStyles.current_page}` : ""}`}>{paginate.page}</span>}
            </>
          )
        })}
        {currentPage < totalPages &&
          <span onClick={goNextPage} className={paginatorStyles.paginator_item}>Next</span>
        }
      </div>

      <div className={styles.mobileTable}>
      {paginatedData.map((userInfo) => {
            return (
              <div key={userInfo.id}>
                {Object.keys(userInfo).map((field,index) => {
                  let value = userInfo[field];
                  if (typeof value === "object" && field !== "address") {
                    value = JSON.stringify(value);
                  }
                  if(field === "company"){
                    const {name,catchPhrase,bs} = JSON.parse(value);
                    console.log(name);
                    return (<div className={styles.mobileFlex+" "+styles.company} key={userInfo.id + "_" + field}><div>{tableHeaders[index]}:</div><div><div>{`${name} --- ${bs}`}</div><div className={styles.companyCatchPhrase}>"{catchPhrase}"</div></div></div>)
                  }
                  return (<div className={styles.mobileFlex} key={userInfo.id + "_" + field}><div>{tableHeaders[index]}:</div><div>{value}</div></div>)
                })}
              </div>
            )
          })}
     </div>
     <div className={paginatorStyles.paginator+" "+paginatorStyles.mobile}>
        {currentPage > 1 &&
          <span onClick={goPreviousPage} className={paginatorStyles.paginator_item}>{"<"}</span>
        }
        {pagination.map((paginate) => {
          return (
            <>
              {paginate.ellipsis && <span className={paginatorStyles.paginator_ellipsis}>...</span>}
              {!paginate.ellipsis && <span onClick={(e)=>changePage(paginate.page,e)} className={`${paginatorStyles.paginator_item}${paginate.current ? ` ${paginatorStyles.current_page}` : ""}`}>{paginate.page}</span>}
            </>
          )
        })}
        {currentPage < totalPages &&
          <span onClick={goNextPage} className={paginatorStyles.paginator_item}>{">"}</span>
        }
      </div>
    </div>
  );
}
// { page: loopThroughPage, current: false, ellipsis: true }

export default App;
