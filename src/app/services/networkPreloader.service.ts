import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';

export declare var navigator: { connection: any; };

/**
 * 
 */
@Injectable({ providedIn: 'root' })
export class NetworkAwarePreloadStrategy implements PreloadingStrategy {

    /**
     * 
     * @param route 
     * @param load 
     * @returns 
     */
    preload(route: Route, load: () => Observable<any>): Observable<any> {
        return this.hasGoodConnection() ? load() : EMPTY;
    }

    hasGoodConnection(): boolean {
        const conn = navigator.connection;
        if (conn) {
            if (conn.saveData) {
                return false;
            }
            const avoidTheseConnections = ['slow-2g', '2g' /* , '3g', '4g' */];
            const effectiveType = conn.effectiveType || '';
            if (avoidTheseConnections.includes(effectiveType)) {
                return false;
            }
        }
        return true;
    }
}