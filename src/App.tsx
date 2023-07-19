import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { usePagination } from './hooks/usePagination';
import { getUserList, IUsers } from './services/UserServices';
import styles from './styles/table.module.scss';

const tableHeaders = ["Id", "Name", "Username", "Email", "Address", "Phone", "Website", "Company"]

function App() {
  const [userList, setUserList] = useState<IUsers[]>([])
  const [loading, setLoading] = useState(false);
  const [dataPerPage, setDataPerPage] = useState(1);
  const { paginatedData, pagination, currentPage, pages: totalPages, goNextPage, goPreviousPage, changePage } = usePagination({ dataPerPage, data: userList, startFrom: 4 });
  console.log(paginatedData);
  console.log(pagination);
  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUserList();
      setUserList(data);
    } catch (err) {
      console.debug(err);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    getUser();
  }, [])

  return (
    <div className="App">
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
                  if (typeof value === "object") {
                    value = JSON.stringify(value);
                  }
                  return (<td key={userInfo.id + "_" + field}>{value}</td>)
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div>
        {currentPage > 1 &&
          <button className="paginated_button">prev</button>
        }
        {pagination.map((paginate) => {
          return (
            <>
              {paginate.ellipsis && <span>...</span>}
              {!paginate.ellipsis && <button className={`paginated_button${paginate.current ? " current_page" : ""}`}>{paginate.page}</button>}
            </>
          )
        })}
        {currentPage < totalPages &&
          <button className="paginated_button">Next</button>
        }
      </div>
    </div>
  );
}
// { page: loopThroughPage, current: false, ellipsis: true }

export default App;
