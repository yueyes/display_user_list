import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from './hooks/usePagination';
import { getUserList, IUsers } from './services/UserServices';
import styles from './styles/table.module.scss';
import paginatorStyles from './styles/paginator.module.scss';
import filterStyles from './styles/filter.module.scss';
import Search from './assets/search.svg';
import Cross from './assets/cross.svg';
import GoogleMap from './assets/google-map-icon.svg';
import './App.css';

const tableHeaders = ["Id", "Name", "Username", "Email", "Address", "Phone", "Website", "Company"]

export interface IDisplayUsers extends Omit<IUsers, "address"> {
  address: JSX.Element;
}

function App() {
  const [userList, setUserList] = useState<IDisplayUsers[]>([])
  const [loading, setLoading] = useState(false);
  const [dataPerPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(false);
  const [filter, setFilter] = useState("name");
  const [isAppliedFilter, setIsAppliedFilter] = useState(false);
  const [input, setInput] = useState("");

  const FilteredUserList = useMemo(() => {
    if (isAppliedFilter) {
      return userList.filter((user) => user[filter].includes(input))
    }
    return userList
  }, [userList, isAppliedFilter, filter, input])

  // console.log("Filtered : ", FilteredUserList);

  const onSelectFilter = (event: React.SyntheticEvent<HTMLSelectElement, Event>) => {
    setFilter(event.currentTarget.value);
  }
  const { paginatedData, pagination, currentPage, pages: totalPages, goNextPage, goPreviousPage, changePage } = usePagination({ dataPerPage, data: FilteredUserList, startFrom: 1, isAppliedFilter });
  // console.log("Paginated : ", paginatedData);
  // console.log(pagination);
  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUserList();
      setUserList(data.map((dat) => {
        return {
          ...dat,
          address: <>{dat.address.suite}, {dat.address.street}, {dat.address.city}, {dat.address.zipcode}<a className={styles.addressLatLngLink} rel="noopener noreferrer" target="_blank" href={`https://maps.google.com/?q=${dat.address.geo.lat},${dat.address.geo.lng}`}><img alt="google map" src={GoogleMap} /></a></>
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
  }, [getUser])

  const onClickFilter = (e: any) => {
    if (!openFilter) {
      setOpenFilter(true);
      return;
    }
    resetAllFilter(e);
    setOpenFilter(false);
  }

  const applyFilter = (e: any) => {
    if (isAppliedFilter) {
      resetAllFilter(e);
    } else {
      setIsAppliedFilter(true);
      changePage(1, e)
    }
  }

  const resetAllFilter = (e: any) => {
    setIsAppliedFilter(false);
    setInput("");
    setFilter("name");
    changePage(1, e)
    // setOpenFilter(false);
  }

  const onChangeInput = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    setInput(event.target.value)
  }



  return (
    <div className="App" style={{ overflowX: "auto" }}>
      <div><h1 className={styles.title} style={{ color: "#FFF" }}>User list <div onClick={onClickFilter} className={styles.mobileSearchIcon}><img alt="search" src={openFilter ? Cross : Search} /></div></h1></div>
      {
        openFilter &&
        <div className={filterStyles.centerContainer}>
          <div className={filterStyles.layoutContainer}>
            <div className={filterStyles.filterContainer}>
              <div className={filterStyles.selectContainer}>
                <label style={{ color: "#FFF", fontSize: 10 }} htmlFor='filter-select'>Select Filter</label>
                <select id="filter-select" value={filter} onChange={onSelectFilter} className={filterStyles.select}>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Number</option>
                </select>
              </div>
              <div className={filterStyles.inputContainer}>
                <label style={{ visibility: "hidden" }} htmlFor='filter-input'>Value</label>
                <input id="filter-input" value={input} onChange={onChangeInput} className={filterStyles.input} placeholder='Enter filter value' />
              </div>
            </div>
            <div className={filterStyles.filterButtonContainer}>
              <button onClick={applyFilter} className={filterStyles.filterButton}>{isAppliedFilter ? "Remove Filter" : "Apply Filter"}</button>
            </div>
          </div>
        </div>
      }
      {
        FilteredUserList.length > 0 && <>
          <table className={styles.userInfo}>
            <thead className={styles.userTableHeader}>
              <tr>
                {tableHeaders.map((field) => <th key={field}>{field}</th>)}
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
                      if (field === "company") {
                        const { name, catchPhrase, bs } = JSON.parse(value);
                        return (<td key={userInfo.id + "_" + field}><div className={styles.companyName}>{`${name}`}</div><div className={styles.companyBs}>{bs}</div><div className={styles.companyCatchPhrase}>"{catchPhrase}"</div></td>)
                      }
                      if (field === "website") {
                        return <td key={userInfo.id + "_" + field}><a className={styles.website} rel="noopener noreferrer" target="_blank" href={`https://${value}`}>{value}</a></td>
                      }
                      if (field === "email") {
                        // <a href="mailto:someone@example.com"></a>
                        return <td key={userInfo.id + "_" + field}><a className={styles.website} href={`mailto:${value}`}>{value}</a></td>
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
                  {paginate.ellipsis && <span key={paginate.page} className={paginatorStyles.paginator_ellipsis}>...</span>}
                  {!paginate.ellipsis && <span key={paginate.page} onClick={(e) => changePage(paginate.page, e)} className={`${paginatorStyles.paginator_item}${paginate.current ? ` ${paginatorStyles.current_page}` : ""}`}>{paginate.page}</span>}
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
                  {Object.keys(userInfo).map((field, index) => {
                    let value = userInfo[field];
                    if (typeof value === "object" && field !== "address") {
                      value = JSON.stringify(value);
                    }
                    if (field === "company") {
                      const { name, catchPhrase, bs } = JSON.parse(value);
                      return (<div className={styles.mobileFlex + " " + styles.company} key={userInfo.id + "_" + field}><div className={styles.mobileItem}>{tableHeaders[index]}:</div><div className={styles.mobileItem}><div className={styles.companyName}>{`${name}`}</div><div className={styles.companyBs}>{bs}</div><div className={styles.companyCatchPhrase}>"{catchPhrase}"</div></div></div>)
                    }
                    if (field === "website") {
                      return (<div className={styles.mobileFlex} key={userInfo.id + "_" + field}><div className={styles.mobileItem}>{tableHeaders[index]}:</div><a rel="noopener noreferrer" target="_blank" href={`https://${value}`} className={`${styles.mobileItem} ${styles.website}`}>{value}</a></div>)
                    }
                    if (field === "email") {
                      return (<div className={styles.mobileFlex} key={userInfo.id + "_" + field}><div className={styles.mobileItem}>{tableHeaders[index]}:</div><a href={`mailto${value}`} className={`${styles.website} ${styles.mobileItem}`}>{value}</a></div>)
                    }
                    return (<div className={styles.mobileFlex} key={userInfo.id + "_" + field}><div className={styles.mobileItem}>{tableHeaders[index]}:</div><div className={styles.mobileItem}>{value}</div></div>)
                  })}
                </div>
              )
            })}
          </div>
          <div className={paginatorStyles.paginator + " " + paginatorStyles.mobile}>
            {currentPage > 1 &&
              <span onClick={goPreviousPage} className={paginatorStyles.paginator_item}>{"<"}</span>
            }
            {pagination.map((paginate) => {
              return (
                <>
                  {paginate.ellipsis && <span key={paginate.page} className={paginatorStyles.paginator_ellipsis}>...</span>}
                  {!paginate.ellipsis && <span key={paginate.page} onClick={(e) => changePage(paginate.page, e)} className={`${paginatorStyles.paginator_item}${paginate.current ? ` ${paginatorStyles.current_page}` : ""}`}>{paginate.page}</span>}
                </>
              )
            })}
            {currentPage < totalPages &&
              <span onClick={goNextPage} className={paginatorStyles.paginator_item}>{">"}</span>
            }
          </div>
        </>
      }
    </div>
  );
}
// { page: loopThroughPage, current: false, ellipsis: true }

export default App;
