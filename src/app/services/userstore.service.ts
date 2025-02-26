import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { signalStore, withState, patchState, withMethods, withComputed } from "@ngrx/signals";

export interface UserState {
  user_type: string,
  name: string,
  user_id: string,
  user_profile_image: string,
  longtitude: Number,
  latitude: Number
}

const initialState:UserState = {
  user_id:"",
  name:"",
  user_type:"buyer",
  user_profile_image:"",
  latitude:0.0,
  longtitude:0.0
}

export const signalstore = signalStore(
  withState<UserState>(initialState),
  withMethods((store)=>({
    setuser(userType:string,userName:string,userId:string,userProfileImage:string){
      patchState(store,{
        user_type:userType,
        user_id:userId,
        user_profile_image:userProfileImage,
        name:userName
      })
    },
    setusertype(type:string){
      patchState(store,{user_type:type})
    },
    clearStore(){
      patchState(store,{
        user_id:"",
        name:"",
        user_profile_image:"",
        latitude:0.0,
        longtitude:0.0
      })
    }
  })
  ),
  withComputed((store)=>({}))
)


@Injectable({
  providedIn: 'root'
})
export class UserstateService {

  constructor(private location:Location) { }

}