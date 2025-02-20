import { Injectable } from '@angular/core';
import { SellerRegister, BuyerRegister } from '../../api/models';

@Injectable({providedIn: 'root'})
export class SignUpTypeChangeService {
    constructor() { }
    
    //uses predefined data from the forms in signup to convert 
    convertDataToSellerType(data: any): SellerRegister {
        return {
            shop_name: data.name,
            password: data.password,
            username: data.username,
            email: data.email,
            phone_number: data.phone,
            profile_picture: data.profile_picture,
            description: data.shopDescription,
            directions: data.shopDirections,
            category: data.shopCategory,
            address: {
                longitude: data.location.longitude,
                latitude: data.location.latitude,
                house_number: data.houseNumber | 0,
                street: data.street,
                city: data.city,
            }
            /* cardNumber: data.cardNumber,
            cardExpiry: data.cardExpiry,
            cvv: data */
        }
    }


    convertDataToBuyerType(data: any) : BuyerRegister {
        return {
            buyername: data.name,
            password: data.password,
            username: data.username,
            email: data.email,
            profile_picture: data.profile_picture,
            phone_number: data.phone,
            shipping_address: data.shipping_address || '',
            address: {
                longitude: data.location.longitude,
                latitude: data.location.latitude,
                house_number: data.houseNumber | 0,
                street: data.street,
                city: data.city,
            }
           /*  cardNumber: data.cardNumber,
            cardExpiry: data.cardExpiry,
            cvv: data.cvv */
        }
    }
}