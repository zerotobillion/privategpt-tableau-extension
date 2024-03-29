import { DataSource, DataSourceType } from "../types";

interface DatasourcesBarProps {
    datasources: DataSource[]
    selectedDatasourceName: string;
    selectedDatasourceType: DataSourceType;
    onChangeDataSource: any;
}

const DatasourcesBar: React.FC<DatasourcesBarProps> = ({ datasources, selectedDatasourceName, onChangeDataSource, selectedDatasourceType }) => {
    const onSelectDatasource = (e: any) => {
        onChangeDataSource(e.target.value, 'summary');
    }

    return (
        <div className="">
            <div className="">
                <div className="flex gap-1">
                    <select onChange={onSelectDatasource} value={selectedDatasourceName}
                        className="w-28 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-gray-500 focus:border-blue-500 block py-1 px-2
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-1">
                        <option></option>
                        {datasources.map((datasource: DataSource) => (
                            <option key={datasource.name} >{datasource.name}</option>
                        ))}
                    </select>
                    <ul className="text-sm flex font-medium text-gray-900 bg-white border border-gray-200 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <li className="border-b border-r border-gray-200 rounded-l-md dark:border-gray-600 pr-2">
                            <div className="flex items-center ps-2">
                                <input id="radio-datasource-summary" onChange={() => onChangeDataSource(selectedDatasourceName, 'summary')}
                                    type="radio" value="summary" name="list-radio" checked={selectedDatasourceType == 'summary'}
                                    className="w-3 h-3 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-700
                                dark:focus:ring-offset-gray-700 focus:ring-1 dark:bg-gray-600 dark:border-gray-500" />
                                <label htmlFor="radio-datasource-summary" className="w-full py-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Summary </label>
                            </div>
                        </li>
                        <li className="border-b border-gray-200 rounded-r-md dark:border-gray-600">
                            <div className="flex items-center ps-2 pe-2">
                                <input id="radio-datasource-full" onChange={() => onChangeDataSource(selectedDatasourceName, 'full')}
                                    checked={selectedDatasourceType == 'full'} type="radio" value="full" name="list-radio"
                                    className="w-3 h-3 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-700
                                dark:focus:ring-offset-gray-700 focus:ring-1 dark:bg-gray-600 dark:border-gray-500" />
                                <label htmlFor="radio-datasource-full" className="w-full py-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Full</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        // </div>
    )
}

export default DatasourcesBar;
