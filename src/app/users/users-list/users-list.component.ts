import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { fromEvent } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../core/models/user';
import { UsersDataSource } from '../../core/services/users.datasource';
import { UsersService } from '../../core/services/users.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { UserDeleteDialogComponent } from './../user-delete/user-delete-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, AfterViewInit {

    public displayedColumns = ['userName', 'firstName', 'lastName', 'isLoggedIn', 'details', 'update', 'delete'];

    dataSource: UsersDataSource;
    @ViewChild(MatSort, {static: false}) sort: MatSort;
    @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
    @ViewChild('input', {static: false}) input: ElementRef;
    currentUser: User;

    usersLength = 0;

	sortProperty = '';
	
    private dialogConfig;

    // tslint:disable-next-line:max-line-length
    constructor(private repository: UsersService, private errorService: ErrorHandlerService, private router: Router, private dialog: MatDialog, private changeDetectorRefs: ChangeDetectorRef) { }
    ngOnInit() {

        this.dataSource = new UsersDataSource(this.repository, this.errorService);

        this.dataSource.loadUsers('', '', 'asc', 0, 6);

        this.dialogConfig = {
            height: '200px',
            width: '400px',
            disableClose: true,
            data: {}
        };
    }

    ngAfterViewInit(): void {

        this.sort.sortChange.subscribe((event) => {
            this.paginator.pageIndex = 0;
            this.sortProperty = event.active;
        });

        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;

                    this.loadUsersPage();
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadUsersPage())
            )
            .subscribe(

                data => {
                    console.log(data);
                }

            );

        }

    public redirectToAdd = () => {
        const url = `/users/create`;
        this.router.navigate([url]);
    }

    public redirectToDetails = (id: string) => {
        const url = `/users/details/${id}`;
        this.router.navigate([url]);
    }

    public redirectToUpdate = (id: string) => {
        const url = `/users/update/${id}`;
        this.router.navigate([url]);
    }

    public redirectToDelete = (id: string) => {
        this.dialogConfig.data = {
            id: id
        };

        const dialogRef = this.dialog.open(UserDeleteDialogComponent, this.dialogConfig)
            .afterClosed().subscribe(result => {
                this.loadUsersPage();
            });
    }
    loadUsersPage() {
        this.dataSource.loadUsers(

            this.input.nativeElement.value,
            this.sortProperty,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);

    }
}
