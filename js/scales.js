/**
 * User: ryan
 * Date: 12-10-09
 * Time: 10:29 AM
 */
define('js/scales', ['d3'], function (d3) {

    var scales = {
       'second' : 1000
    };
    scales.minute = scales.second * 60;
    scales.hour = scales.minute * 60;
    scales.day  = scales.hour * 24;
    scales.week = scales.day * 7;
    scales.month = scales.day * 31;
    scales.year = scales.month * 12;
    scales.multi_year = scales.year * 100;



    scales.getMeanDate = function(domain) {
     return new Date( d3.mean(domain, function(d){ return d.getTime();  }));
    };

    scales.getDuration = function(domain) {
        return domain[1].getTime() - domain[0].getTime();
    };


    scales.getScale = function(domain) {
        var duration = scales.getDuration(domain);
        if (duration <= scales.minute) return scales.minute;
        if (duration <= scales.hour) return scales.hour;
        if (duration <= scales.day) return scales.day;
        if (duration <= scales.week) return scales.week;
        if (duration <= scales.month) return scales.month;
        if (duration <= scales.year) return scales.year;
        return scales.multi_year;
    };

    scales.getScaleExtent = function(scale) {
        if (scale <= scales.minute) return [0.0000003, 6];
        if (scale <= scales.hour) return [0.000003, 378];
        if (scale <= scales.day) return [0.0004, 5000];
        if (scale <= scales.week) return [0.0005, 60144];
        if (scale <= scales.month) return [0.005, 221672];
        if (scale <= scales.year) return [0.05, 3174442];
        return [0.5, 325932957];
    };


    scales.slideTo = function(middle_date, domain) {
        var scale = {
            left_date:  domain[0],
            right_date: domain[1]
        };

    };


    scales.zoomInSingleToScale = function(middle_date, from_scale)  {
        if (from_scale == scales.multi_year) return scales.year;
        if (from_scale == scales.year) return scales.month;
        if (from_scale == scales.month) return scales.week;
        if (from_scale == scales.week) return scales.day;
        if (from_scale == scales.day) return scales.hour;
        if (from_scale == scales.hour) return scales.minute;
        if (from_scale == scales.minute) return scales.minute;

    };

    scales.zoomOutSingleToScale = function(middle_date, from_scale)  {
        if (from_scale == scales.multi_year) return scales.multi_year;
        if (from_scale == scales.year) return scales.multi_year;
        if (from_scale == scales.month) return scales.year;
        if (from_scale == scales.week) return scales.month;
        if (from_scale == scales.day) return scales.week;
        if (from_scale == scales.hour) return scales.day;
        if (from_scale == scales.minute) return scales.hour;

    };

    scales.getToScaleInfoFromDomain = function(domain) {

    };


    scales.getToScaleInfo = function(middle_date, to_scale) {
        var x = to_scale/2;
        var left_date = new Date(middle_date.getTime() - x);
        var right_date = new Date(middle_date.getTime() + x);
        var scale_extent = scales.getScaleExtent(to_scale);
        return {
            left_date : left_date,
            right_date : right_date,
            scale_extent : scale_extent
        };
    };
    return scales;
});