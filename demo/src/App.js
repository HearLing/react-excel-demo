import React, { useState } from "react";
import { Button, Upload, message } from "antd";
import * as XLSX from "xlsx";
import ExportJsonExcel from "js-export-excel";
import { UploadOutlined , MenuOutlined} from '@ant-design/icons';
import SortableTable from "./SortableTable"
import { SortableHandle } from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);
const columns = [
  {
    title: '顺序',
    dataIndex: 'sort',
    width: 60,
    className: 'drag-visible',
    render: () => <DragHandle />,
  },
  {
    title: '项目id',
    dataIndex: 'id',
    className: 'drag-visible',
  },
  {
    title: '项目名称',
    dataIndex: 'name',
    className: 'drag-visible',
  },
  {
    title: '所属公司',
    dataIndex: 'belong',
  },
  {
    title: '项目阶段',
    dataIndex: 'step',
  },{
    title: '项目标签',
    dataIndex: 'tag',
  },
];

const data = [
  {
    key: '1',
    id: '123123123',
    name: 'TCL大厦',
    belong: "美的置业公司 > 美的珠三角区域 > 深圳公司",
    step: '设计阶段',
    tag:'',
    index: 0,
  },
  {
    key: '2',
    id: '123123124',
    name: 'TCL大厦',
    belong: "美的置业公司 > 美的珠三角区域 > 深圳公司",
    step: '设计阶段',
    tag:'土方阶段',
    index: 1,
  },
  {
    key: '3',
    id: '123123125',
    name: 'TCL大厦',
    belong: "美的置业公司 > 美的珠三角区域 > 深圳公司",
    step: '设计阶段',
    tag:'土方阶段、主体阶段',
    index: 2,
  },
];

function App() {
  const [uploadData, setUploadData] = useState([])
  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: '未上传',//文件名称
      state: 'uploading'
    },
  ])

  const downloadFileToExcel = () => {
    let dataTable = [];  //excel文件中的数据内容
    let option = {};  //option代表的就是excel文件
    dataTable  = data;  //数据源
    option.fileName = "下载文件";  //excel文件名称
    console.log("data===",dataTable)
    option.datas = [
        {
            sheetData: dataTable,  //excel文件中的数据源
            sheetName: 'Sheet1',  //excel文件中sheet页名称
            sheetFilter: ['id', 'name', 'belong', 'step','tag'],  //excel文件中需显示的列数据
            sheetHeader: ['项目id', '项目名称', '所属公司', '项目阶段','项目标签'],  //excel文件中每列的表头名称
        }
    ]
    let toExcel = new ExportJsonExcel(option);  //生成excel文件
    toExcel.saveExcel();  //下载excel文件
  };
  
  
  const props = {
    name: "file",
    action: 'https://www.fastmock.site/mock/541c77bf52ac9530f9e22d855c2e220e/excel/api/excel', //上传的地址
    accept: ".xls,.xlsx,application/vnd.ms-excel", //接受的数据类型
    maxCount: 1, // 限制上传数量。当为 1 时，始终用最新上传的文件代替当前文件
    headers: {
      authorization: 'authorization-text',
    },
    onRemove: (file) => {
      setUploadData([])
      setFileList([
        {
          uid: '-1',
          name: '未上传',//文件名称
          state: 'error'
        },
      ])
    },
    beforeUpload: (file) => { // 在此阶段处理数据  shangc
      const f = file;
      const reader = new FileReader(); // new一个FileReader对象
      reader.onload = function (e) {
        try{
          const datas = e.target.result;
          const workbook = XLSX.read(datas, {type: "binary",}); //解析datas
          const first_worksheet = workbook.Sheets[workbook.SheetNames[0]]; //是工作簿中的工作表的第一个sheet
          const jsonArr = XLSX.utils.sheet_to_json(first_worksheet, {header: 1,defval:''}); //将工作簿对象转换为JSON对象数组
          console.log("jsonArr",{...jsonArr})
          setUploadData({...jsonArr})
          setFileList([
            {
              uid: '-1',
              name: file.name,
              state: 'done'
            }
          ])
          message.success('Excel上传解析成功！')
        }catch(e){
          message.error('文件类型不正确！或文件解析错误')
        } 
        // console.log("uploadData",uploadData)
      };
      const r =reader.readAsBinaryString(f);
      // console.log("uploadData",uploadData)
    },
    onChange: (info) =>{
      console.log("info",info)
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div>
      <Upload {...props} fileList={fileList}>
        <Button icon={<UploadOutlined />}>导入</Button>
      </Upload>

      <Button
        type="primary"
        onClick={downloadFileToExcel}
      >
        导出
      </Button>
      <SortableTable columns={columns} data={data}/>
    </div>
  );
}

export default App;
