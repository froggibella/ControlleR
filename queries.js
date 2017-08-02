// bluebird erstellt js- Promises für asynchrone Serveranfragen
var bluebird = require('bluebird'); // or any other Promise/A+ compatible library;
// system end of line markup
var os = require('os');

var options = {
    promiseLib: bluebird
};

//pgp= Pretty Good Privacy-Verschlüsselung
var pgp = require('pg-promise')(options);

// db connection
var fs = require('fs');
var db;
// read login credentials
fs.readFile('Connections', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    // make db connection available as variable
    db = pgp(data.split(os.EOL)[0]);
});



function getRevenues() {
    return db.any("SELECT yyyy_mm, iso_month_in_year, iso_year, net_revenue FROM ap_financial_forecast.t_monthly_data")
}

function getCurrentRevenues() {
    return db.any(" SELECT                                                                                                               " +
        "     yyyy_mm,                                                                                                         " +
        "     iso_month_in_year,                                                                                               " +
        "     iso_year,                                                                                                        " +
        "     number_of_days_in_month,                                                                                         " +
        "     max(iso_day_in_month) AS current_day_in_month,                                                                   " +
        "     sum(grand_total_net) AS current_revenue,                                                                         " +
        "     sum(grand_total_net) / max(iso_day_in_month)  AS mean_revenue_per_day,                                           " +
        "     sum(grand_total_net) / max(iso_day_in_month) * number_of_days_in_month  AS current_reachable_revenue             " +
        "   FROM dwh_sales_order.order_fact                                                                                    " +
        "   JOIN dwh_sales_order.order_dim ON order_dim.order_key = order_fact.order_key                                       " +
        "   JOIN dwh_date_time.date_dim ON order_fact.order_date_key = date_dim.date_key                                       " +
        "   WHERE iso_date >= date_trunc('month', current_date)                                                                " +
        "    AND order_dim.order_valid = 1                                                                                     " +
        "   GROUP BY 1,2,3,4                                                                                                   " +
        "   ORDER BY 1 asc;                                                                                                    "     );
}

function getLatestRevenues() {
    return db.any("   with rev_current as (                                                              "+
        "     select max(yyyy_mm) last_rev_month from ap_financial_forecast.t_monthly_data     "+
        "   )                                                                                  "+
        "   select * from ap_financial_forecast.t_monthly_data                                 "+
        "     JOIN rev_current ON last_rev_month = t_monthly_data.yyyy_mm                      ");
}

function getPredictedRevenues() {
    return db.any("select date, forecast_monthly_revenue.yyyy_mm as create_month, date_dim.yyyy_mm as prediction, previous_month, previous_year, predicted_months, round(mean:: numeric, 2) AS mean,round(low_80:: numeric) AS low_80,round(high_80:: numeric) AS high_80,round(low_95:: numeric) AS low_95,round(high_95:: numeric) AS high_95, method, create_date from ap_financial_forecast.forecast_monthly_revenue left join dwh_date_time.date_dim ON (iso_year = split_part(forecast_monthly_revenue.predicted_months,' ', 2 )::int AND en_mmm = split_part(forecast_monthly_revenue.predicted_months,' ', 1 )) GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13 ORDER BY 1 desc,2");
}

function getLatestPredictedRevenues() {
    return db.any(
        "   WITH get_latest_month AS (                                                                       " +
        "     SELECT max(yyyy_mm) last_month FROM ap_financial_forecast.forecast_monthly_revenue             " +
        "   ),                                                                                               " +
        "   rev_current AS (                                                                                 " +
        "     SELECT max(yyyy_mm) last_rev_month                                                             " +
        "     FROM ap_financial_forecast.forecast_monthly_revenue                                            " +
        "     LEFT JOIN get_latest_month ON get_latest_month.last_month = yyyy_mm                            " +
        "     WHERE last_month ISNULL                                                                        " +
        "   ),                                                                                               " +
        "    first_pred as (                                                                                 " +
        "     SELECT min(date_dim.yyyy_mm) first_pred                                                        " +
        "     FROM ap_financial_forecast.forecast_monthly_revenue                                            " +
        "     JOIN rev_current ON last_rev_month = forecast_monthly_revenue.yyyy_mm                          " +
        "     LEFT JOIN dwh_date_time.date_dim                                                               " +
        "             ON (iso_year = split_part(forecast_monthly_revenue.predicted_months, ' ', 2) :: INT    " +
        "             AND en_mmm = split_part(forecast_monthly_revenue.predicted_months, ' ', 1))            " +
        "     )                                                                                              " +
        "   select                                                                                           " +
        "     date,                                                                                          " +
        "     forecast_monthly_revenue.yyyy_mm,                                                              " +
        "     date_dim.yyyy_mm as prediction,                                                                " +
        "     previous_month,                                                                                " +
        "     previous_year,                                                                                 " +
        "     predicted_months, round(mean:: numeric, 2) AS mean,                                            " +
        "     round(low_80:: numeric) AS low_80,                                                             " +
        "     round(high_80:: numeric) AS high_80,                                                           " +
        "     round(low_95:: numeric) AS low_95,                                                             " +
        "     round(high_95:: numeric) AS high_95,                                                           " +
        "     method,                                                                                        " +
        "     create_date                                                                                    " +
        "   from ap_financial_forecast.forecast_monthly_revenue                                              " +
        "     left JOin dwh_date_time.date_dim                                                               " +
        "       ON (iso_year = split_part(forecast_monthly_revenue.predicted_months,' ', 2 )::int            " +
        "     AND en_mmm = split_part(forecast_monthly_revenue.predicted_months,' ', 1 )                     " +
        "    )                                                                                               " +
        "     join rev_current ON last_rev_month = forecast_monthly_revenue.yyyy_mm                          " +
        "     join first_pred on first_pred = date_dim.yyyy_mm                                               " +
        "     GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13                                                         " );
}

function getCurrentPredictedRevenues() {
    return db.any("   WITH get_latest_month AS (                                                                              " +
        "        SELECT max(yyyy_mm) last_month FROM ap_financial_forecast.forecast_monthly_revenue                 " +
        "    ),                                                                                                     " +
        "     first_pred as (                                                                                       " +
        "      SELECT min(date_dim.yyyy_mm) first_pred                                                              " +
        "      FROM ap_financial_forecast.forecast_monthly_revenue                                                  " +
        "      JOIN get_latest_month ON get_latest_month.last_month = forecast_monthly_revenue.yyyy_mm              " +
        "      LEFT JOIN dwh_date_time.date_dim                                                                     " +
        "              ON (iso_year = split_part(forecast_monthly_revenue.predicted_months, ' ', 2) :: INT          " +
        "              AND en_mmm = split_part(forecast_monthly_revenue.predicted_months, ' ', 1))                  " +
        "      )                                                                                                    " +
        "      select                                                                                               " +
        "        date,                                                                                              " +
        "        forecast_monthly_revenue.yyyy_mm,                                                                  " +
        "        date_dim.yyyy_mm as prediction,                                                                    " +
        "        previous_month,                                                                                    " +
        "        previous_year,                                                                                     " +
        "        predicted_months, round(mean:: numeric, 2) AS mean,                                                " +
        "        round(low_80:: numeric) AS low_80,                                                                 " +
        "        round(high_80:: numeric) AS high_80,                                                               " +
        "        round(low_95:: numeric) AS low_95,                                                                 " +
        "        round(high_95:: numeric) AS high_95,                                                               " +
        "        method,                                                                                            " +
        "        create_date                                                                                        " +
        "      from ap_financial_forecast.forecast_monthly_revenue                                                  " +
        "        left JOin dwh_date_time.date_dim                                                                   " +
        "          ON (iso_year = split_part(forecast_monthly_revenue.predicted_months,' ', 2 )::int                " +
        "        AND en_mmm = split_part(forecast_monthly_revenue.predicted_months,' ', 1 )                         " +
        "       )                                                                                                   " +
        "        join get_latest_month ON get_latest_month.last_month = forecast_monthly_revenue.yyyy_mm            " +
        "        join first_pred on first_pred = date_dim.yyyy_mm                                                   " +
        "        GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13                                                             " );
}


function getOrders() {
    return db.any("SELECT yyyy_mm, iso_month_in_year, iso_year, number_of_orders FROM ap_financial_forecast.t_monthly_data");
}

function getLatestOrders() {
    return db.any("   with rev_current as (                                                              "+
        "     select max(yyyy_mm) last_rev_month from ap_financial_forecast.t_monthly_data     "+
        "   )                                                                                  "+
        "   select * from ap_financial_forecast.t_monthly_data                                 "+
        "     JOIN rev_current ON last_rev_month = t_monthly_data.yyyy_mm                      ");
}

function getCurrentOrders() {
    return db.any(" SELECT                                                                                                               " +
        "     yyyy_mm,                                                                                                         " +
        "     iso_month_in_year,                                                                                               " +
        "     iso_year,                                                                                                        " +
        "     number_of_days_in_month,                                                                                         " +
        "     max(iso_day_in_month) AS current_day_in_month,                                                                   " +
        "     count(order_fact.order_key) AS number_of_orders,                                                                 " +
        "     count(order_fact.order_key) / max(iso_day_in_month)  AS mean_orders_per_day,                                     " +
        "     count(order_fact.order_key) / max(iso_day_in_month) * number_of_days_in_month  AS current_reachable_orders       " +
        "   FROM dwh_sales_order.order_fact                                                                                    " +
        "   JOIN dwh_sales_order.order_dim ON order_dim.order_key = order_fact.order_key                                       " +
        "   JOIN dwh_date_time.date_dim ON order_fact.order_date_key = date_dim.date_key                                       " +
        "   WHERE iso_date >= date_trunc('month', current_date)                                                                " +
        "    AND order_dim.order_valid = 1                                                                                     " +
        "   GROUP BY 1,2,3,4                                                                                                   " +
        "   ORDER BY 1 asc                                                                                                   ");
}

function getPredictedOrders() {
    return db.any("select date, forecast_monthly_orders.yyyy_mm as create_month, date_dim.yyyy_mm as prediction,  previous_month, previous_year, predicted_months, round(mean:: numeric) AS mean,round(low_80:: numeric) AS low_80,round(high_80:: numeric) AS high_80,round(low_95:: numeric) AS low_95,round(high_95:: numeric) AS high_95, method, create_date from ap_financial_forecast.forecast_monthly_orders left join dwh_date_time.date_dim ON (iso_year = split_part(forecast_monthly_orders.predicted_months,' ', 2 )::int AND en_mmm = split_part(forecast_monthly_orders.predicted_months,' ', 1 )) GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13 ORDER BY 1 desc,2");
}

function getLatestPredictedOrders() {

    return db.any(
        "   WITH get_latest_month AS (                                                                       " +
        "     SELECT max(yyyy_mm) last_month FROM ap_financial_forecast.forecast_monthly_orders             " +
        "   ),                                                                                               " +
        "   rev_current AS (                                                                                 " +
        "     SELECT max(yyyy_mm) last_rev_month                                                             " +
        "     FROM ap_financial_forecast.forecast_monthly_orders                                            " +
        "     LEFT JOIN get_latest_month ON get_latest_month.last_month = yyyy_mm                            " +
        "     WHERE last_month ISNULL                                                                        " +
        "   ),                                                                                               " +
        "    first_pred as (                                                                                 " +
        "     SELECT min(date_dim.yyyy_mm) first_pred                                                        " +
        "     FROM ap_financial_forecast.forecast_monthly_orders                                            " +
        "     JOIN rev_current ON last_rev_month = forecast_monthly_orders.yyyy_mm                          " +
        "     LEFT JOIN dwh_date_time.date_dim                                                               " +
        "             ON (iso_year = split_part(forecast_monthly_orders.predicted_months, ' ', 2) :: INT    " +
        "             AND en_mmm = split_part(forecast_monthly_orders.predicted_months, ' ', 1))            " +
        "     )                                                                                              " +
        "   select                                                                                           " +
        "     date,                                                                                          " +
        "     forecast_monthly_orders.yyyy_mm,                                                              " +
        "     date_dim.yyyy_mm as prediction,                                                                " +
        "     previous_month,                                                                                " +
        "     previous_year,                                                                                 " +
        "     predicted_months, round(mean:: numeric, 2) AS mean,                                            " +
        "     round(low_80:: numeric) AS low_80,                                                             " +
        "     round(high_80:: numeric) AS high_80,                                                           " +
        "     round(low_95:: numeric) AS low_95,                                                             " +
        "     round(high_95:: numeric) AS high_95,                                                           " +
        "     method,                                                                                        " +
        "     create_date                                                                                    " +
        "   from ap_financial_forecast.forecast_monthly_orders                                              " +
        "     left JOin dwh_date_time.date_dim                                                               " +
        "       ON (iso_year = split_part(forecast_monthly_orders.predicted_months,' ', 2 )::int            " +
        "     AND en_mmm = split_part(forecast_monthly_orders.predicted_months,' ', 1 )                     " +
        "    )                                                                                               " +
        "     join rev_current ON last_rev_month = forecast_monthly_orders.yyyy_mm                          " +
        "     join first_pred on first_pred = date_dim.yyyy_mm                                               " +
        "     GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13  ");
}

function getCurrentPredictedOrders() {
    return db.any("  WITH get_latest_month AS (                                                                              " +
        "      SELECT max(yyyy_mm) last_month FROM ap_financial_forecast.forecast_monthly_orders                   " +
        "  ),                                                                                                      " +
        "   first_pred as (                                                                                        " +
        "    SELECT min(date_dim.yyyy_mm) first_pred                                                               " +
        "    FROM ap_financial_forecast.forecast_monthly_orders                                                    " +
        "    JOIN get_latest_month ON get_latest_month.last_month = forecast_monthly_orders.yyyy_mm                " +
        "    LEFT JOIN dwh_date_time.date_dim                                                                      " +
        "            ON (iso_year = split_part(forecast_monthly_orders.predicted_months, ' ', 2) :: INT            " +
        "            AND en_mmm = split_part(forecast_monthly_orders.predicted_months, ' ', 1))                    " +
        "    )                                                                                                     " +
        "    select                                                                                                " +
        "      date,                                                                                               " +
        "      forecast_monthly_orders.yyyy_mm,                                                                    " +
        "      date_dim.yyyy_mm as prediction,                                                                     " +
        "      previous_month,                                                                                     " +
        "      previous_year,                                                                                      " +
        "      predicted_months, round(mean:: numeric, 2) AS mean,                                                 " +
        "      round(low_80:: numeric) AS low_80,                                                                  " +
        "      round(high_80:: numeric) AS high_80,                                                                " +
        "      round(low_95:: numeric) AS low_95,                                                                  " +
        "      round(high_95:: numeric) AS high_95,                                                                " +
        "      method,                                                                                             " +
        "      create_date                                                                                         " +
        "    from ap_financial_forecast.forecast_monthly_orders                                                    " +
        "      left JOin dwh_date_time.date_dim                                                                    " +
        "        ON (iso_year = split_part(forecast_monthly_orders.predicted_months,' ', 2 )::int                  " +
        "      AND en_mmm = split_part(forecast_monthly_orders.predicted_months,' ', 1 )                           " +
        "     )                                                                                                    " +
        "      join get_latest_month ON get_latest_month.last_month = forecast_monthly_orders.yyyy_mm              " +
        "      join first_pred on first_pred = date_dim.yyyy_mm                                                    " +
        "      GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13                                                              "  );
}

// make functions available in other js modules
module.exports = {
    getPredictedRevenues: getPredictedRevenues,
    getRevenues: getRevenues,
    getOrders: getOrders,
    getPredictedOrders: getPredictedOrders,
    getLatestPredictedRevenues: getLatestPredictedRevenues,
    getLatestPredictedOrders: getLatestPredictedOrders,
    getLatestRevenues: getLatestRevenues,
    getLatestOrders: getLatestOrders,
    getCurrentPredictedOrders:getCurrentPredictedOrders,
    getCurrentPredictedRevenues:getCurrentPredictedRevenues,
    getCurrentOrders:getCurrentOrders,
    getCurrentRevenues:getCurrentRevenues
};


