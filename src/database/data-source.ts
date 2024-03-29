import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database-option';

const AppDataSource = new DataSource(dataSourceOptions);
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
export default AppDataSource;
