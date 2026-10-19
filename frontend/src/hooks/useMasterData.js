

// export function useMasterData(endpoint, params = {} , options = {}) {

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { manual = false } = options;


//   const fetchAll = async (overrideParams) => {

//     setLoading(true);
//     setError(null);
//     try {
//       const activeParams = overrideParams ?? params;

//       const hasFilter = Object.values(activeParams || {}).some(
//         (v) => v !== null && v !== "" && v !== undefined,
//       );

//       const res = hasFilter ? await getDataParams(`${endpoint}`, activeParams) : await getAll(endpoint);
//     //   const res = Object.keys(params).length > 0 ? await getDataParams(`${endpoint}`, params) : await getAll(endpoint);
//       setData(res?.data || []);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to fetch data");
//       toast.error(err?.response?.data?.message || "Failed to load data");
//     } finally {
//       setLoading(false);
//     }

//   };

// //   const createOrUpdate = async (payload) => {
// //     return await addEdit(endpoint, payload);
// //   };

// //   const softDelete = async (payload) => {
// //     const response = await addEdit(endpoint, payload);
// //     await fetchAll();
// //     return response;
// //   };

// //   const deleteItem = async (id) => {
// //     return await remove(endpoint, id);
// //   };

//   useEffect(() => {
//      if (!manual)  fetchAll();
//   }, [endpoint, JSON.stringify(params)]);

//   return {
//     data,
//     loading,
//     fetchAll,
//     createOrUpdate,
//     deleteItem,
//     softDelete,
//   };
// }
