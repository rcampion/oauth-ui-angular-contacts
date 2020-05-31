import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginationPage, PaginationPropertySort } from '../interface/pagination';
import { map , catchError } from 'rxjs/operators';
import { Contact } from '../interface/contact.model';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {

    constructor(private http: HttpClient,
        private errorService: ErrorHandlerService) { }

    public getData = (route: string) => {
        return this.http.get(this.createCompleteRoute(route, environment.api_url), this.generateHeaders());
    }

    public create = (route: string, body) => {
        return this.http.post(this.createCompleteRoute(route, environment.api_url), body, this.generateHeaders());
    }

    public update = (route: string, body) => {
        return this.http.put(this.createCompleteRoute(route, environment.api_url), body, this.generateHeaders());
    }

    public delete = (route: string) => {
        return this.http.delete(this.createCompleteRoute(route, environment.api_url), this.generateHeaders());
    }

    private createCompleteRoute = (route: string, envAddress: string) => {
        return `${envAddress}/${route}`;
    }

    findGroupsWithSortAndFilter(

        filter = '', sort: PaginationPropertySort,
        pageNumber = 0, pageSize = 3): Observable<any> {
        let apiUrl = this.createCompleteRoute('group', environment.api_url);
        const paramsx: any = { page: pageNumber, size: pageSize };
        if (sort != null) {
            paramsx.sort = sort.property + ',' + sort.direction;
        }

        let sortTest = sort.direction;
        if (sort.property !== '') {
            sortTest = sort.property + ',' + sort.direction;
        }

        let search: string;
        if (filter !== '') {
            apiUrl = this.createCompleteRoute('group/search', environment.api_url);

            search = 'groupName==*' + filter + '* or ' + 'groupDescription==*' + filter + '*';
            // search = 'groupDescription==' + filter + '*';

        }
        return this.http.get(apiUrl, {
            headers: new HttpHeaders(
                {
                'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Authorization': 'Bearer ' + Cookie.get('access_token')
            }),
            params: new HttpParams()

                .set('search', search)

                .set('sort', sortTest)

                .set('page', pageNumber.toString())
                .set('size', pageSize.toString())

        }).pipe(
            // map(res => res['content']
            map(res => res),
            catchError(error => { this.errorService.handleError(error); return Observable.throw(error.statusText); })
        );
    }

    findGroupMembersWithSortAndFilter(
        groupId = 0,
        filter = '', sort: PaginationPropertySort,
        pageNumber = 0, pageSize = 3): Observable<any> {

        const id: number = groupId;
        const buildApiUrl = 'group/member/' + id;
        let apiUrl = this.createCompleteRoute(buildApiUrl, environment.api_url);
        const paramsx: any = { page: pageNumber, size: pageSize };
        if (sort != null) {
            paramsx.sort = sort.property + ',' + sort.direction;
        }

        let sortTest = sort.direction;
        if (sort.property !== '') {
            sortTest = sort.property + ',' + sort.direction;
        }
        let search: string;
        if (filter !== '') {
            apiUrl = this.createCompleteRoute('contact/search', environment.api_url);
            // search = 'firstName==' + filter + '* or ' + 'lastName==' + filter + '*';
            // search = 'lastName==' + filter + '*';
            search = 'firstName==*' + filter + '* or ' + 'lastName==*' + filter + '* or ' + 'company==*' + filter  + '*';
        }
        return this.http.get(apiUrl, {
            headers: new HttpHeaders(
                {
                'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Authorization': 'Bearer ' + Cookie.get('access_token')
            }),
            params: new HttpParams()
                .set('search', search)
                .set('sort', sortTest)
                .set('page', pageNumber.toString())
                .set('size', pageSize.toString())

        }).pipe(
            // map(res => res['content']
            map(res => res),
            catchError(error => { this.errorService.handleError(error); return Observable.throw(error.statusText); })
        );
    }

    private generateHeaders() {
        return {

            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': 'Bearer ' + Cookie.get('access_token')
                })
        };
    }
}
