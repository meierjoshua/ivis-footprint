SELECT d1.year AS Year, d1.country AS Country, c.iso_alpha_2_code AS Iso_2, c.iso_alpha_3_code AS Iso_3, d2.total as BiocapPerCap, d3.total as BiocapTotGHA_d3, d4.total as EFConsPerCap, d5.total as EFConsTotGHA_d5,
IF( d5.total < d3.total,  (d3.total - d5.total) / d5.total, (d3.total - d5.total) / d3.total) AS Bilance,
d2.total - d4.total AS DifferencePerCap
FROM nfa_2019_public_data d1
LEFT JOIN gfn_country_code_concordance_table c ON c.gfn_name = d1.country
LEFT JOIN nfa_2019_public_data d2 ON d2.year = d1.year AND d2.country_code = d1.country_code AND d2.record = "BiocapPerCap"
LEFT JOIN nfa_2019_public_data d3 ON d3.year = d1.year AND d3.country_code = d1.country_code AND d3.record = "BiocapTotGHA"
LEFT JOIN nfa_2019_public_data d4 ON d4.year = d1.year AND d4.country_code = d1.country_code AND d4.record = "EFConsPerCap"
LEFT JOIN nfa_2019_public_data d5 ON d5.year = d1.year AND d5.country_code = d1.country_code AND d5.record = "EFConsTotGHA"
WHERE d1.country = "Namibia"
GROUP BY d1.year, d1.country
ORDER BY  d1.country, d1.year;