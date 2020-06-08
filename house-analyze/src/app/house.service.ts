import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { House } from './house';

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  constructor(
    private service: BaseService
  ) { }

  getHouses(obj): Observable<House[]> {
    return this.service.get({ url: 'api/houses', params: obj })
  }

  getHousesCount(obj): Observable<any> {
    return this.service.get({ url: 'api/houses/count', params: obj })
  }
}
