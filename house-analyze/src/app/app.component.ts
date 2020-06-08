import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { HouseService } from './house.service';
import { House } from './house';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  filterColumns: string[] = ['communityName', 'price', 'price_d', 'xiaoqujunjia', 'area', 'area_in', 'louceng', 'room', 'chaoxiang'];
  displayedColumns: string[] = ['communityName', 'domainName', 'price', 'price_d', 'xiaoqujunjia', 'area', 'area_in', 'louceng', 'room', 'chaoxiang','action'];
  dataSource: MatTableDataSource<House>;
  loading = false
  pageCount = 0
  pageIndex = 1
  pageSize = 10
  listParams = {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private houseService: HouseService) {
    this.getHouseList();
  }

  ngOnInit() {
    // this.dataSource.sort = this.sort;
  }

  getHouseList() {
    this.listParams['page'] = this.pageIndex
    this.listParams['pageNum'] = this.pageSize
    this.houseService.getHouses(this.listParams).subscribe(res=>{
      this.dataSource=new MatTableDataSource(res);
      if(this.loading==true){
        this.loading = false;
      }
      this.getHousesCount()
    })
  }

  getHousesCount() {
    this.houseService.getHousesCount(this.listParams).subscribe(res=>{
      this.pageCount = res.count
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.listParams = {
      where: {
        $text: { $search: filterValue }
      }
    }
    this.houseService.getHousesCount(this.listParams).subscribe(res=>{
      this.pageCount = res.count
    })
  }

  sortData(event: Event) {
    let sort = {}
    this.listParams['active'] = event['active']
    this.listParams['direction'] = event['direction']
    this.pageIndex = 1
    this.loading = true;
    this.getHouseList()
  }

  pageChange(event: Event) {
    this.pageIndex = event['pageIndex'] + 1
    this.pageSize = event['pageSize'] + 1
    this.getHouseList()
  }
}