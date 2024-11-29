import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { 
  TextField, 
  MenuItem, 
  Modal, 
  Box, 
  Typography, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Pagination,
  CircularProgress,
  IconButton
} from "@mui/material";
import { 
  Close as CloseIcon, 
  ImageNotSupported as ImageNotSupportedIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import axios from "axios";

const ImageZoomModal = ({ 
  open, 
  onClose, 
  imageSrc, 
  alt 
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 3)); // Max zoom of 3x
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 1)); // Min zoom of 1x
  };

  return (
    <Modal
  open={open}
  onClose={onClose}
  className="flex items-center justify-center"
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  }}
>
  <Box
    className="bg-white w-full max-w-[90vw] max-h-[90vh] rounded-xl shadow-lg relative overflow-hidden"
    sx={{
      position: 'relative',
      outline: 'none',
      border: '1px solid #e0e0e0',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '80vh', // Ensure the modal fits within the viewport
      overflow: 'hidden', // Prevent unwanted overflow
    }}
  >
    {/* Zoom Controls and Close Button */}
    <Box
      className="absolute top-4 right-4 flex items-center space-x-2 z-10"
      sx={{
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <IconButton
        onClick={handleZoomOut}
        color="primary"
        disabled={zoom <= 1}
        className="bg-gray-100 hover:bg-gray-200"
      >
        <ZoomOutIcon />
      </IconButton>
      <IconButton
        onClick={handleZoomIn}
        color="primary"
        disabled={zoom >= 3}
        className="bg-gray-100 hover:bg-gray-200"
      >
        <ZoomInIcon />
      </IconButton>
      <IconButton
        onClick={onClose}
        color="default"
        className="bg-gray-100 hover:bg-gray-200"
      >
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Scrollable Content */}
    <Box
      className="flex-grow overflow-y-auto px-4 py-4"
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '4px',
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        style={{
          transform: `scale(${zoom})`,
          transition: 'transform 0.3s ease',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        className="cursor-move"
      />
    </Box>
  </Box>
</Modal>

  
  
  );
};

function CameraData() {
  const currentDate = new Date();
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [day, setDay] = useState(currentDate.getDate());
  const [timePeriod, setTimePeriod] = useState("day");
  const [cameraId, setCameraId] = useState("1");
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const snapshotsPerPage = 20;
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [imageZoomModalOpen, setImageZoomModalOpen] = useState(false);





  // Updated year options to include past years, excluding future years
  const yearOptions = (() => {
    const currentYear = currentDate.getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).filter(y => y <= currentYear);
  })();

  // Camera options from 1 to 26
  const cameraOptions = Array.from({ length: 26 }, (_, i) => ({
    value: (i + 1).toString(), 
    label: `Camera ${i + 1}`
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' })
  }));

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getDayOptions = (year, month) => {
    const maxDay = getDaysInMonth(year, month);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // If the selected year and month are less than current year and month, 
    // allow full range of days
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return Array.from({ length: maxDay }, (_, i) => i + 1);
    }

    // If it's the current year and month, limit to current day
    if (year === currentYear && month === currentMonth) {
      return Array.from({ length: currentDay }, (_, i) => i + 1);
    }

    // Fallback to an empty array if something goes wrong
    return [];
  };
  const [chartData, setChartData] = useState({
    series: [{ name: 'Snapshots', data: [] }],
    options: {
      chart: {
        type: 'bar',
        height: 200,
        background: '#ffffff',
        toolbar: { show: true },
        events: {
          dataPointSelection: () => handleOpenSnapshotModal()
        }
      },
      plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '80%' } },
      dataLabels: { enabled: false },
      xaxis: { 
        categories: [], 
        labels: { 
          rotate: -45, 
          trim: true, 
          style: { fontSize: '12px' } 
        } 
      },
      yaxis: { title: { text: 'Number of Snapshots' } },
      colors: ['#4caf50'],
      title: {
        text: 'Camera Data',
        align: 'center',
        style: { fontSize: '20px', fontWeight: 500 }
      },
      noData: {
        text: 'No Data Available',
        align: 'center',
        verticalAlign: 'middle',
        style: {
          color: '#888888',
          fontSize: '18px'
        }
      }
    }
  });

  const fetchData = async () => {
    setLoading(true);
    setNoDataAvailable(false);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
  
    let url;
    switch (timePeriod) {
      case "day":
        url = `https://ng3m7737-8000.inc1.devtunnels.ms/snapdate/${year}/${formattedMonth}/${formattedDay}?camera_id=${cameraId}`;
        break;
      case "month":
        url = `https://ng3m7737-8000.inc1.devtunnels.ms/snapmonth/${year}/${formattedMonth}?camera_id=${cameraId}`;
        break;
      case "year":
        url = `https://ng3m7737-8000.inc1.devtunnels.ms/snapmonth/${year}?camera_id=${cameraId}`;
        break;
      default:
        setLoading(false);
        return;
    }
  
    try {
      const response = await axios.get(url);
      let data;
  
      // Modify this part to handle different response structures
      if (timePeriod === "day") {
        // For daily view, use the response directly
        data = response.data;
      } else {
        // For month and year views, handle the response accordingly
        data = response.data;
      }
      
      if (!data || data.length === 0) {
        setNoDataAvailable(true);
        setSnapshots([]);
        setChartData(prev => ({
          ...prev,
          series: [{ name: 'Snapshots', data: [] }],
          options: {
            ...prev.options,
            xaxis: { 
              ...prev.options.xaxis,
              categories: [] 
            },
            title: {
              ...prev.options.title,
              text: `Camera Data - ${timePeriod === 'day' ? `${year}-${formattedMonth}-${formattedDay}` : (timePeriod === 'month' ? `${year}-${formattedMonth}` : year)}`
            }
          }
        }));
        return;
      }
  
      setSnapshots(data);
  
      const categories = data.map(snap => {
        return timePeriod === "day" ? snap.time : 
               timePeriod === "month" ? snap.filename.split('.')[0] : 
               new Date(snap.filename).toLocaleString('default', { month: 'short' });
      });
  
      const seriesData = Array(categories.length).fill(1);
  
      setChartData(prev => ({
        ...prev,
        series: [{ name: 'Snapshots', data: seriesData }],
        options: {
          ...prev.options,
          xaxis: { 
            ...prev.options.xaxis,
            categories 
          },
          title: {
            ...prev.options.title,
            text: `Camera Data - ${timePeriod === 'day' ? `${year}-${formattedMonth}-${formattedDay}` : (timePeriod === 'month' ? `${year}-${formattedMonth}` : year)}`
          }
        }
      }));
    } catch (error) {
      console.error("Error fetching snapshot data:", error);
      setNoDataAvailable(true);
      setSnapshots([]);
      
      // Reset chart data when there's an error
      setChartData(prev => ({
        ...prev,
        series: [{ name: 'Snapshots', data: [] }],
        options: {
          ...prev.options,
          xaxis: { 
            ...prev.options.xaxis,
            categories: [] 
          }
        }
      }));
    } finally {
      setLoading(false);
    }
  };


  const fetchSnapshots = async () => {
    setModalLoading(true);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    try {
      const response = await axios.get(
        `https://ng3m7737-8000.inc1.devtunnels.ms/snapdate/${year}/${formattedMonth}/${formattedDay}?camera_id=${cameraId}`
      );
      setSnapshots(response.data);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setModalLoading(false);
    }
  };

  

  useEffect(() => {
    // Modify the useEffect to respect the current time period selection
    switch (timePeriod) {
      case "day":
        // For day view, adjust day if needed
        const dayOptions = getDayOptions(year, month);
        const adjustedDay = Math.min(day, dayOptions[dayOptions.length - 1]);
        if (adjustedDay !== day) {
          setDay(adjustedDay);
        }
        break;
      case "month":
        // For month view, set day to 1 
        setDay(1);
        break;
      case "year":
        // For year view, set day and month to 1
        setDay(1);
        setMonth(1);
        break;
    }
    
    // Fetch data after adjusting the date
    fetchData();
  }, [timePeriod, year, month, day, cameraId]);
  const renderDateSelectors = () => {
    switch (timePeriod) {
      case "day":
        return (
          <>
            <TextField
              select
              size="small"
              variant="outlined"
              label="Year"
              className="w-full md:w-32 bg-white"
              value={year}
              onChange={(e) => {
                const selectedYear = Number(e.target.value);
                setYear(selectedYear);
                
                // Adjust month and day based on the selected year
                const maxDaysInMonth = getDaysInMonth(selectedYear, month);
                const newDay = Math.min(day, maxDaysInMonth);
                setDay(newDay);
                
                // Fetch data with the updated date
                fetchData();
              }}
            >
              {yearOptions.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  {yearOption}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              variant="outlined"
              label="Month"
              className="w-full md:w-32 bg-white"
              value={month}
              onChange={(e) => {
                const selectedMonth = Number(e.target.value);
                setMonth(selectedMonth);
                
                // Adjust day based on the selected month and year
                const maxDaysInMonth = getDaysInMonth(year, selectedMonth);
                const newDay = Math.min(day, maxDaysInMonth);
                setDay(newDay);
                
                // Fetch data with the updated date
                fetchData();
              }}
            >
              {monthOptions
                .filter(monthOption => 
                  year < currentDate.getFullYear() || 
                  monthOption.value <= currentDate.getMonth() + 1
                )
                .map((monthOption) => (
                  <MenuItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              size="small"
              variant="outlined"
              label="Day"
              className="w-full md:w-32 bg-white"
              value={day}
              onChange={(e) => {
                const selectedDay = Number(e.target.value);
                setDay(selectedDay);
                
                // Fetch data with the updated date
                fetchData();
              }}
            >
              {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)
                .filter(dayOption => 
                  year < currentDate.getFullYear() || 
                  month < currentDate.getMonth() + 1 || 
                  dayOption <= currentDate.getDate()
                )
                .map((dayOption) => (
                  <MenuItem key={dayOption} value={dayOption}>
                    {dayOption}
                  </MenuItem>
                ))}
            </TextField>
          
          </>
        );
      case "month":
        return (
          <>
            <TextField
              select
              size="small"
              variant="outlined"
              label="Year"
              className="w-full md:w-32 bg-white"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  {yearOption}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              variant="outlined"
              label="Month"
              className="w-full md:w-32 bg-white"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions
                .filter(monthOption => 
                  year < currentDate.getFullYear() || 
                  monthOption.value <= currentDate.getMonth() + 1
                )
                .map((monthOption) => (
                  <MenuItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </MenuItem>
                ))}
            </TextField>
          </>
        );
      case "year":
        return (
          <TextField
            select
            size="small"
            variant="outlined"
            label="Year"
            className="w-full md:w-32 bg-white"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((yearOption) => (
              <MenuItem key={yearOption} value={yearOption}>
                {yearOption}
              </MenuItem>
            ))}
          </TextField>
        );
      default:
        return null;
    }
  };

  const handleImageError = (filename) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [filename]: true
    }));
  };

  const handleOpenSnapshotModal = () => {
    fetchSnapshots();
    setSnapshotModalOpen(true);
    setCurrentPage(1); // Reset to first page when modal opens
  };

  const indexOfLastSnapshot = currentPage * snapshotsPerPage;
  const indexOfFirstSnapshot = indexOfLastSnapshot - snapshotsPerPage;
  const currentSnapshots = snapshots.slice(indexOfFirstSnapshot, indexOfLastSnapshot);


  
  const handleImageZoom = (image) => {
    setZoomedImage(image === zoomedImage ? null : image);
  };

  const handleImageClick = (snapshot) => {
    setSelectedImage(snapshot);
    setImageZoomModalOpen(true);
  };

  const handleImageZoomModalClose = () => {
    setImageZoomModalOpen(false);
    setSelectedImage(null);
  };


  return (
    <div className="w-full bg-white shadow-md rounded-lg p-4">
  <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
    <h5 className="text-lg font-medium text-gray-800 md:mr-auto mb-2 md:mb-0">
      Camera Data
    </h5>

    {/* Input Container with improved spacing */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full space-x-2 space-y-2">
      {/* Camera ID with spacing */}
      <div className="mb-2">
      <TextField
        select
        size="small"
        variant="outlined"
        label="Camera ID"
        className="w-full mb-2"
        value={cameraId}
        onChange={(e) => setCameraId(e.target.value)}
      >
        {cameraOptions.map((camera) => (
          <MenuItem key={camera.value} value={camera.value}>
            {camera.label}
          </MenuItem>
        ))}
      </TextField>
      </div>

      {/* View By with spacing */}
      <TextField
        select
        size="small"
        variant="outlined"
        label="View By"
        className="w-full mb-3"
        value={timePeriod}
        onChange={(e) => setTimePeriod(e.target.value)}
      >
        <MenuItem value="day">Daily</MenuItem>
        <MenuItem value="month">Monthly</MenuItem>
        <MenuItem value="year">Yearly</MenuItem>
      </TextField>

      {/* Dynamic Date Selectors with spacing */}
      {renderDateSelectors()}
    </div>
  </div>

  <div className="px-4">
    {loading ? (
      <div className="flex justify-center items-center h-[430px]">
        <CircularProgress />
      </div>
    ) : noDataAvailable ? (
      <ReactApexChart
        options={{
          ...chartData.options,
          noData: {
            text: 'No Data Available for Selected Period',
            align: 'center',
            verticalAlign: 'middle',
            style: {
              color: '#888888',
              fontSize: '18px'
            }
          }
        }}
        series={[{ name: 'Snapshots', data: [] }]}
        type="bar"
        height={430}
        width="100%"
      />
    ) : (
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={430}
        width="100%"
      />
    )}
  </div>


      <Modal
        open={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        aria-labelledby="snapshot-modal-title"
        className="flex items-center justify-center"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none'
        }}
      >
        <Box 
          className="bg-white w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl relative"
          sx={{ 
            position: 'relative',
            outline: 'none',
            border: '1px solid #e0e0e0',
            boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
            padding: '24px',
            '&:focus': {
              outline: 'none'
            },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
          }}
        >
          {/* Close Icon */}
          <CloseIcon 
            onClick={() => setSnapshotModalOpen(false)}
            className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors z-10"
            fontSize="medium"
          />

          {/* Header */}
          <div className="bg-gray-100 -mx-6 -mt-6 mb-6 px-6 py-4 rounded-t-2xl">
            <Typography 
              id="snapshot-modal-title" 
              variant="h5" 
              component="h2" 
              className="text-gray-800 font-semibold"
            >
              Snapshots for Camera {cameraId}
            </Typography>
          </div>
          
          {/* Loading State */}
          {modalLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <CircularProgress />
            </div>
          ) : (
            <TableContainer 
              sx={{ 
                maxHeight: '60vh', 
                overflowY: 'auto',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '4px',
                },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-bold text-gray-700 bg-gray-100">Filename</TableCell>
                    <TableCell className="font-bold text-gray-700 bg-gray-100">Time</TableCell>
                    <TableCell className="font-bold text-gray-700 bg-gray-100">Image</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentSnapshots.map((snapshot) => (
                    <TableRow 
                      key={snapshot.filename} 
                      hover 
                      className="transition-colors duration-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleImageClick(snapshot)}
                    >
                      <TableCell className="text-gray-800">{snapshot.filename}</TableCell>
                      <TableCell className="text-gray-700">{snapshot.time}</TableCell>
                      <TableCell>
                        {imageLoadErrors[snapshot.filename] ? (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                            <ImageNotSupportedIcon className="text-gray-500" />
                          </div>
                        ) : (
                          <img 
                            src={snapshot.path} 
                            alt={snapshot.filename}
                            className="object-cover rounded-md shadow-sm transition-transform duration-300 hover:scale-110"
                            onError={() => handleImageError(snapshot.filename)}
                            loading="lazy"
                            style={{
                              width: '50px', 
                              height: '50px', 
                              maxWidth: '100%', 
                              maxHeight: '100%'
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>
        {/* Image Zoom Modal */}
        {selectedImage && (
        <ImageZoomModal
          open={imageZoomModalOpen}
          onClose={handleImageZoomModalClose}
          imageSrc={selectedImage.path}
          alt={selectedImage.filename}
        />
      )}
    </div>
  );
}

export default CameraData;