import { SAUserViewModel } from './sa.user.view.model';

export type UserViewModel = Omit<SAUserViewModel, 'banInfo'>;
