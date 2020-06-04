import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Contact } from '../../core/interface/contact.model';
import { ContactsDataSource } from '../../core/services/contacts.datasource';
import { ContactsService } from '../../core/services/contacts.service';
import { PostService } from '../../core/services/post.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { Router } from '@angular/router';
import { ContactDeleteDialogComponent } from './../contact-delete/contact-delete-dialog.component';
import { defaultItemsCountPerPage } from './../../common/constants';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge } from 'rxjs';
import { fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-contact-list',
    templateUrl: './contact-list.component.html',
    styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit, AfterViewInit, OnDestroy {

    public displayedColumns = ['firstName', 'lastName', 'company', 'details', 'update', 'delete'];

    dataSource: ContactsDataSource;

    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild('input', { static: false }) input: ElementRef;

    currentContact: Contact;

    contacts: Contact[];

    contactsLength = 0;

    sortProperty = '';

    private dialogConfig;

    deleteContactDialogRef: MatDialogRef<ContactDeleteDialogComponent>;

    pageNumber: number;

    private unsubscribeSubject: Subject<void> = new Subject<void>();

    // tslint:disable-next-line:max-line-length
    constructor(private service: PostService, private repository: ContactsService, private errorService: ErrorHandlerService, private router: Router, private dialog: MatDialog, private changeDetectorRefs: ChangeDetectorRef) { }

    ngOnInit() {

        this.dataSource = new ContactsDataSource(this.repository, this.errorService);

        this.dataSource.loadContacts('', '', 'asc', 0, 6);

        this.dialogConfig = {
            height: '200px',
            width: '400px',
            disableClose: true,
            data: {}
        };

        this.service
            .onPost()
            .pipe(takeUntil(this.unsubscribeSubject))
            .subscribe(post => {

                this.dataSource.loadContacts('', '', 'asc', 0, 6);

            });

    }

    ngOnDestroy(): void {
        this.unsubscribeSubject.next();
        this.unsubscribeSubject.complete();
    }

    ngAfterViewInit() {

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

                    this.loadContactsPage();
                })
            )
            .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadContactsPage())
            )
            .subscribe(

                data => {
                    console.log(data);
                }

            );
    }

    public redirectToAdd = () => {
        const url = `/contact/create`;
        this.router.navigate([url]);
    }

    public redirectToDetails = (id: string) => {
        const url = `/contact/details/${id}`;
        this.router.navigate([url]);
    }

    public redirectToUpdate = (id: string) => {
        const url = `/contact/update/${id}`;
        this.router.navigate([url]);
    }

    public redirectToDelete = (id: string) => {
        this.dialogConfig.data = {
            id: id
        };
        const dialogRef = this.dialog.open(ContactDeleteDialogComponent, this.dialogConfig)
            .afterClosed().subscribe(result => {
                this.loadContactsPage();
            });
    }

    loadContactsPage() {
        this.dataSource.loadContacts(

            this.input.nativeElement.value,
            this.sortProperty,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);

    }

}
