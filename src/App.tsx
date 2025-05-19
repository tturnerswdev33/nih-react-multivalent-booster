import { useEffect, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  ClientSideRowModelModule,
  PaginationModule,
  TooltipModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ValidationModule,
  CellStyleModule
} from 'ag-grid-community';
import Papa from 'papaparse';
import { ExternalLink } from 'lucide-react';

import './App.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  PaginationModule,
  TooltipModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ValidationModule,
  CellStyleModule
]);
const headerStyle = document.createElement('style');
headerStyle.innerHTML = `
  #network-branding {
    width: 100vw;
    margin: 0;
    padding: 0;

    background-color: #531958;
    color: #fff;
    min-height: 30px;
    padding: 0.25rem 0;
  }
  #network-branding .container {
    max-width: 1140px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  #network-branding .masthead-logo {
    height: 20px;
    margin-left: 25px;
    margin-right: 0.5rem;
  }
  #network-branding .masthead-link {
    color: #fff;
    text-decoration: none;
    margin-right: 1rem;
    font-size: 0.75rem;
  }
  #network-branding .masthead-link span {
    white-space: nowrap;
  }
  @media (min-width: 769px) {
    #network-branding .masthead-link span.d-md-inline-block,
    #network-branding .masthead-link span.d-lg-inline-block,
    #network-branding .masthead-link span.d-xl-inline-block {
      display: inline-block;
    }
    #network-branding .masthead-link span.d-md-none,
    #network-branding .masthead-link span.d-lg-none,
    #network-branding .masthead-link span.d-xl-none {
      display: none;
    }
  }
  @media (max-width: 768px) {
    #network-branding .masthead-link span.d-md-inline-block,
    #network-branding .masthead-link span.d-lg-inline-block,
    #network-branding .masthead-link span.d-xl-inline-block {
      display: none;
    }
    #network-branding .masthead-link span.d-md-none,
    #network-branding .masthead-link span.d-lg-none,
    #network-branding .masthead-link span.d-xl-none {
      display: inline-block;
    }
  }
  #network-branding img[alt='divider'] {
    height: 30px;
  }
`;
document.head.appendChild(headerStyle);

interface BoosterRow {
  mvb_report_number: string;
  data_source: string;
  data_source_type: string;
  sample_source: string;
  vac_prime: string;
  vac_boost1: string;
  boost1_class: string;
  assay_cat: string;
  assay_type: string;
  assay_type_mod: string;
  viral_lineage: string;
  vaccine_activity: string;
  boost1_time1: string;
  boost1_effect1: string;
  boost1_time2: string;
  boost1_effect2: string;
  boost1_time3: string;
  boost1_effect3: string;
}

export default function App() {
  const [rowData, setRowData] = useState<BoosterRow[]>([]);
  const [filteredData, setFilteredData] = useState<BoosterRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [filters, setFilters] = useState({
    vacBoost: [] as string[],
    infHistory: [] as string[],
    lineage: [] as string[],
    assayCat: [] as string[],
    dataSourceType: [] as string[]
  });

const [expanded, setExpanded] = useState({
  vacPrime: false,
  vacBoost: false,
  lineage: false,
  assayCat: false,
  dataSourceType: false,
});

const Header = () => (
  <>
    <header>
      <div id="network-branding" className="container-fluid text-white">
        <div className="container d-flex align-items-center py-1">
          <img src="/assets/images/masthead-hhs-logo.png" alt="HHS" className="masthead-logo" />
          <a href="https://www.hhs.gov/" className="masthead-link hhs-link">
            <span className="d-none d-xl-inline-block">U.S. Department of Health and Human Services</span>
            <span className="d-xl-none d-inline-block">HHS</span>
          </a>
          <img src="/assets/images/masthead-divider.png" alt="divider" className="masthead-divider" />
          <img src="/assets/images/masthead-nih-logo.png" alt="NIH" className="masthead-logo" />
          <a href="https://www.nih.gov/" className="masthead-link nih-link">
            <span className="d-none d-lg-inline-block">National Institutes of Health</span>
            <span className="d-lg-none d-inline-block">NIH</span>
          </a>
          <img src="/assets/images/masthead-divider.png" alt="divider" className="masthead-divider" />
          <img src="/assets/images/masthead-nih-logo.png" alt="NCATS" className="masthead-logo" />
          <a href="https://www.ncats.nih.gov/" className="masthead-link ncats-link">
            <span className="d-none d-md-inline-block">National Center for Advancing Translational Sciences</span>
            <span className="d-md-none d-inline-block">NCATS</span>
          </a>
        </div>
      </div>
      <div className="brand-container container-fluid bg-white py-3">
        <div className="container d-flex align-items-center gap-3" style={{ paddingTop: '24px', paddingLeft: '24px' }}>
          <img src="/assets/images/ncats.svg" alt="NCATS logo" style={{ height: '50px', marginRight: '16px' }} />
          <a href="/covid19" style={{ color: '#531958', fontSize: '2rem', fontWeight: 'bold', textDecoration: 'none', lineHeight: '50px', borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>OpenData Portal</a>
        </div>
      </div>
    </header>
    <div style={{ height: '25px', backgroundColor: '#fff', borderRadius: '1em', border: '2px solid #77317d', margin: '1em auto 20px auto', padding: '0.8em 0.8em', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '960px' }}>
      <p style={{ paddingTop: '0px', textAlign: 'center', color: '#77317d' }}>
        This repository is under review for potential modification in compliance with Administration directives.
      </p>
    </div>
    <section style={{
      width: '100vw',
      backgroundImage: 'url(/assets/images/cells@2x-CLYDR37Q.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
      padding: '2rem 1.5rem 1.5rem 1.5rem',
      textAlign: 'left',
      position: 'relative'}}>
      <div className="container">
        <h6 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, letterSpacing: '0.25px' }}>OpenData Portal | SARS-CoV-2 Variants & Therapeutics</h6>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', fontFamily: 'PT Sans, sans-serif', color: '#feff00', margin: '0.5rem 0 0.5rem 0', display: 'inline-block' }}> Multivalent Booster Activity</h1>
        <span style={{ marginLeft: '10px', backgroundColor: 'white', color: 'black', padding: '0.25rem 0.75rem', borderRadius: '8px', fontWeight: 'bold' }}>
          Updated 224 days ago
        </span>
        <p style={{ fontSize: '1rem', marginTop: '0.5rem', marginBottom: 0 }}> 
          Browse a database of curated multivalent COVID-19 booster activity against SARS-CoV-2 variants, along with monovalent booster comparisons.<br />
        </p>
        <div style={{ marginTop: '1rem' }}>
          <a href="/data/bivalent_booster.tsv" download style={{ backgroundColor: 'white', color: '#77317d', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', border: '2px solid #77317d' }}>
            Download the Multivalent Booster dataset here
          </a>
        </div>
        
      </div>
    </section>
  </>
);

const Footer = () => (
    <footer style={{ backgroundColor: '#531958', color: 'white', fontSize: '0.875rem', width: '100vw' }}>
          <div className="container" style={{ maxWidth: '100vw', margin: '0 auto', width: '100%' }}>
            <div className="row" style={{ marginLeft: '45px', padding: '2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
              <div className="col-md-4 mb-4">
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  <li><a href="#" style={{ color: 'white', textDecoration: 'underline' }}>HOME</a></li>
                  <li><a href="https://opendata.ncats.nih.gov/covid19/about" style={{ color: 'white', textDecoration: 'underline' }}>ABOUT</a></li>
                  <li><a href="https://opendata.ncats.nih.gov/covid19/databrowser" style={{ color: 'white', textDecoration: 'underline' }}>DATA EXPLORER</a></li>
                </ul>
              </div>
              <div className="col-md-4 mb-4">
                <ul style={{ borderLeft: 'solid 1px #CCCCCC', listStyle: 'none', paddingLeft: '20px' }}>
                  <li><a href="https://www.nih.gov/" style={{ color: 'white', textDecoration: 'underline' }}>NIH HOME</a></li>
                  <li><a href="https://ncats.nih.gov/" style={{ color: 'white', textDecoration: 'underline' }}>NCATS HOME</a></li>
                  <li><a href="https://ncats.nih.gov/privacy" style={{ color: 'white', textDecoration: 'underline' }}>PRIVACY NOTICE</a></li>
                  <li><a href="https://ncats.nih.gov/disclaimer" style={{ color: 'white', textDecoration: 'underline' }}>DISCLAIMER</a></li>
                  <li><a href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html" style={{ color: 'white', textDecoration: 'underline' }}>HHS VULNERABILITY DISCLOSURE</a></li>
                  <li><a href="https://ncats.nih.gov/accessibility" style={{ color: 'white', textDecoration: 'underline' }}>ACCESSIBILITY</a></li>
                </ul>
              </div>
              <div className="col-md-4 col-lg-4">
                <div style={{ backgroundColor: '#6c2d6b', padding: '1rem', borderRadius: '4px', marginRight: '8rem'}}>
                  <p>If you have problems viewing PDF files, download the latest version of <a href="#" style={{ color: 'white', textDecoration: 'underline' }}>Adobe Reader</a>.</p>
                  <p>For language access assistance, contact the <a href="mailto:info@ncats.nih.gov" style={{ color: 'white', textDecoration: 'underline' }}>NCATS Public Information Officer</a>.</p>
                  <p>National Center for Advancing Translational Sciences (NCATS), 6701 Democracy Boulevard, Bethesda, MD 20892-4874 | 📞 301-594-8966</p>
                </div>
              </div>
            </div>
        <div style={{ backgroundColor: '#6c2d6b', borderTop: '1px solid #79457c', paddingTop: '1rem', paddingBottom: '1rem', marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ marginLeft: '5rem' }}>
            <img src="/assets/images/NIH-SVG.svg" alt="NIH logo" style={{ height: '40px' }} />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'center', fontWeight: '400' }}>
            © Copyright 2025, NCATS All rights reserved.
          </div>
        </div>
      </div>
    </footer>
);

  const ExternalLinkRenderer = ({ value }) => {
    if (!value) return null;
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#007bff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          textDecoration: 'none'
        }}
      >
        Link <ExternalLink size={16} strokeWidth={2} />
      </a>
    );
  };

  const toggleExpand = key => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const CustomHeader = (props) => {
    const [line1, line2] = props.displayName.split(' ');
    return (
      <span style={{ whiteSpace: 'pre-line', textAlign: 'left', paddingLeft: '2px' }}>
        {line1}
        <br />
        {line2}
      </span>
    );
  };

  useEffect(() => {
    fetch('/data/bivalent_booster.tsv')
      .then(res => res.text())
      .then(tsvText => {
        const parsed = Papa.parse<BoosterRow>(tsvText, {
          header: true,
          delimiter: '\t',
          skipEmptyLines: true 
        });
        // Filter out rows with missing mvb_report_number
        const cleanRows = parsed.data.filter(
          (row: any) => row.mvb_report_number && row.mvb_report_number.trim() !== ''
        );
        setRowData(cleanRows);
        setFilteredData(cleanRows);

        setColumnDefs([
          { headerComponent: CustomHeader, 
            headerComponentParams: {
              displayName: 'Report Number'
            }, field: 'mvb_report_number', width: 125 },
          {
            headerComponent: CustomHeader, 
            headerComponentParams: {
              displayName: 'Data Source'
            },
            field: 'data_source',
            cellRenderer: 'externalLinkRenderer',
            width: 75,
          },
          { headerName: 'Data Source Type', field: 'data_source_type' },
          { headerComponent: CustomHeader, 
            headerComponentParams: {
              displayName: 'Sample Source'
            }, field: 'sample_source' , width: 100,
            valueFormatter: (params: ValueFormatterParams) =>
            params.value
              ? params.value
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')
              : ''},
          { headerName: 'Infection Status', field: 'infection_history' },
          { headerName: 'Vaccination History', field: 'vac_history' },
          { headerName: 'Booster Vaccine', field: 'vac_boost' },
          { headerName: 'Booster Class', field: 'boost_class' },
          { headerName: 'Assay Category', field: 'assay_cat' },
          { headerName: 'Assay Type', field: 'assay_type' },
          { headerName: 'Assay Modality', field: 'assay_type_mod' },
          { headerName: 'Viral Lineage', field: 'viral_lineage' },
          { headerName: 'Assay Readout', field: 'vaccine_activity' },
          { headerName: 'Time Point 1', field: 'boost1_time1', valueFormatter: (params) => params.value ? `${params.value} days post booster1` : '' },
          { headerName: 'Time Point 1 Effectiveness', field: 'boost1_effect1' },
          { headerName: 'Time Point 2', field: 'boost1_time2', valueFormatter: (params) => params.value ? `${params.value} days post booster2` : '' },
          { headerName: 'Time Point 2 Effectiveness', field: 'boost1_effect2' },
          { headerName: 'Time Point 3', field: 'boost1_time3', valueFormatter: (params) => params.value ? `${params.value} days post booster3` : '' },
          { headerName: 'Time Point 3 Effectiveness', field: 'boost1_effect3' },

        ]);
      });
  }, []);

  const uniqueValuesFor = (key: keyof BoosterRow): string[] =>
    rowData.length > 0
      ? Array.from(new Set(rowData.map(row => row[key]).filter(Boolean))).sort()
      : [];

  const uniqueValues = {
    vacBoost: uniqueValuesFor('vac_boost'),
    infHistory: uniqueValuesFor('infection_history'),
    lineage: uniqueValuesFor('viral_lineage'),
    assayCat: uniqueValuesFor('assay_cat'),
    dataSourceType: uniqueValuesFor('data_source_type')
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

useEffect(() => {
  const filtered = rowData.filter(row => {
    const vacBoostMatch =
      filters.vacBoost.length === 0 ||
      filters.vacBoost.includes(row.vac_boost);

    const infHistoryMatch =
      filters.infHistory.length === 0 ||
      filters.infHistory.includes(row.infection_history);

    const lineageMatch =
      filters.lineage.length === 0 ||
      filters.lineage.includes(row.viral_lineage);

    const assayCatMatch =
      filters.assayCat.length === 0 ||
      filters.assayCat.includes(row.assay_cat);

    const dataSourceTypeMatch =
      filters.dataSourceType.length === 0 ||
      filters.dataSourceType.includes(row.data_source_type);

    return (
      infHistoryMatch &&
      vacBoostMatch &&
      lineageMatch &&
      assayCatMatch &&
      dataSourceTypeMatch
    );
  });

  setFilteredData(filtered);
}, [filters, rowData]);

  return (
    <>
     <Header />
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <aside style={{ width: '300px', padding: '1rem 1rem 1rem 5px', backgroundColor: '#f8f9fa', borderRight: '1px solid #ddd', textAlign: 'left', flexShrink: 0 }}>
        <h4 style={{ color: '#006666', marginBottom: '0.5rem' }}>FILTER BY</h4>
        <hr style={{ borderColor: '#ccc', marginBottom: '1rem' }} />

        {/* Vaccine (Booster) */}
        <div style={{ marginTop: '1rem' }}>
          <div onClick={() => toggleExpand('vacBoost')} style={{ cursor: 'pointer', color: '#006666', fontWeight: 'bold' }}>
            Vaccine (Booster) <span style={{ float: 'right' }}>{expanded.vacBoost ? '\u25BC' : '\u25B6'}</span>
          </div>
          {expanded.vacBoost && (
            <div
              style={{
                marginLeft: '1rem',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ccc',
                paddingRight: '0.5rem'
              }}
            >
              {uniqueValues.vacBoost.map(val => (
                <label key={val} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={filters.vacBoost.includes(val)}
                    onChange={() => handleFilterChange('vacBoost', val)}
                  />{' '}
                  {val}
                </label>
              ))}
            </div>
          )}

        </div>


        {/* Infection History */}
        <div style={{ marginTop: '1rem' }}>
          <div onClick={() => toggleExpand('vacPrime')} style={{ cursor: 'pointer', color: '#006666', fontWeight: 'bold' }}>
            Infection History <span style={{ float: 'right' }}>{expanded.infHistory ? '\u25BC' : '\u25B6'}</span>
          </div>
          {expanded.vacPrime && (
            <div style={{ marginLeft: '1rem' }}>
              {(uniqueValues.infHistory || []).map(val => (
                <label key={val} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={filters.infHistory.includes(val)}
                    onChange={() => handleFilterChange('infHistory', val)}
                  />{' '}
                  {val}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Viral Lineage */}
        <div style={{ marginTop: '1rem' }}>
          <div onClick={() => toggleExpand('lineage')} style={{ cursor: 'pointer', color: '#006666', fontWeight: 'bold' }}>
            Viral Lineage <span style={{ float: 'right' }}>{expanded.lineage ? '\u25BC' : '\u25B6'}</span>
          </div>
          {expanded.lineage && (
            <div style={{ marginLeft: '1rem' }}>
              {(uniqueValues.lineage|| []).map(val => (
                <label key={val} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={filters.lineage.includes(val)}
                    onChange={() => handleFilterChange('lineage', val)}
                  />{' '}
                  {val}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Assay Category */}
        <div style={{ marginTop: '1rem' }}>
          <div onClick={() => toggleExpand('assayCat')} style={{ cursor: 'pointer', color: '#006666', fontWeight: 'bold' }}>
            Assay Category <span style={{ float: 'right' }}>{expanded.assayCat ? '\u25BC' : '\u25B6'}</span>
          </div>
          {expanded.assayCat && (
            <div style={{ marginLeft: '1rem' }}>
              {(uniqueValues.assayCat|| []).map(val => (
                <label key={val} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={filters.assayCat.includes(val)}
                    onChange={() => handleFilterChange('assayCat', val)}
                  />{' '}
                  {val}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Data Source Type */}
        <div style={{ marginTop: '1rem' }}>
          <div onClick={() => toggleExpand('dataSourceType')} style={{ cursor: 'pointer', color: '#006666', fontWeight: 'bold' }}>
            Data Source Type <span style={{ float: 'right' }}>{expanded.dataSourceType ? '\u25BC' : '\u25B6'}</span>
          </div>
          {expanded.dataSourceType && (
            <div style={{ marginLeft: '1rem' }}>
              {(uniqueValues.dataSourceType || []).map(val => (
                <label key={val} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={filters.dataSourceType.includes(val)}
                    onChange={() => handleFilterChange('dataSourceType', val)}
                  />{' '}
                  {val}
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>


      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem', textAlign: 'left' }}>{filteredData.length} Records</h2>
        <div className="ag-theme-alpine" style={{ flex: 1 }}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            pagination={true}
            enableBrowserTooltips={true}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              cellStyle: { textAlign: 'left' }
            }}
            headerHeight={48}
            rowHeight={36}
            components={{
              externalLinkRenderer: ExternalLinkRenderer
            }}
          />
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
