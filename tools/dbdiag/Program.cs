using Npgsql;

var connectionString = "Host=localhost;Port=5432;Database=HMSDev;Username=postgres;Password=aswad;Timeout=5;Command Timeout=10";

await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

var queries = new (string Name, string Sql)[]
{
    ("activity", """
        select pid, state, wait_event_type, wait_event, now() - query_start as age, left(query, 160) as query
        from pg_stat_activity
        where datname = current_database()
        order by query_start nulls last
        """),
    ("locks", """
        select a.pid, a.state, l.locktype, l.mode, l.granted, a.wait_event_type, a.wait_event, left(a.query, 120) as query
        from pg_locks l
        join pg_stat_activity a on a.pid = l.pid
        where a.datname = current_database()
        order by l.granted, a.pid
        """),
    ("patient_count", """
        select count(*)
        from "PatientInfo"
        where "Cancelled" = false
          and "TenantId" = '11111111-1111-1111-1111-111111111111'
          and "PropertyId" = '22222222-2222-2222-2222-222222222222'
        """),
    ("checkup_count", """
        select count(*)
        from "CheckupSummary"
        where "Cancelled" = false
          and "TenantId" = '11111111-1111-1111-1111-111111111111'
          and "PropertyId" = '22222222-2222-2222-2222-222222222222'
        """)
};

foreach (var (name, sql) in queries)
{
    Console.WriteLine($"--- {name}");
    await using var cmd = new NpgsqlCommand(sql, conn);
    try
    {
        await using var reader = await cmd.ExecuteReaderAsync();
        var fieldCount = reader.FieldCount;
        while (await reader.ReadAsync())
        {
            var values = new string[fieldCount];
            for (var i = 0; i < fieldCount; i++)
                values[i] = reader.IsDBNull(i) ? "null" : reader.GetValue(i).ToString() ?? "";
            Console.WriteLine(string.Join(" | ", values));
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"{ex.GetType().Name}: {ex.Message}");
    }
}
