import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database-option';

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
