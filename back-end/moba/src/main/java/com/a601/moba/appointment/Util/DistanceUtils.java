package com.a601.moba.appointment.Util;

import com.a601.moba.appointment.Entity.Place;

public class DistanceUtils {

    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public static double calculateDistance(Place a, Place b) {
        if (a == null || b == null) {
            return Double.MAX_VALUE;
        }
        return calculateDistance(a.getLatitude(), a.getLongitude(), b.getLatitude(), b.getLongitude());
    }
}
