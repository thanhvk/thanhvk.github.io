"use strict";
angular.module('app').factory('$cvToPdf', function(http, $filter, PdfMakeConverter) {

    function setFeatureList(contentList, features) {
        var contentList = contentList;
        var featureContentList = [
            {text: features.name.replace(/\-+/g, ' '), style: ['featureHeader', 'bold']},
            {
                columns: [
                    {
                        image: 'data:image/png;base64,' + features.image,
                        fit: [100, 150]
                    },
                    {
                        width: '25%',
                        stack: [
                            {text: 'Công ty gần đây nhất', style: 'p'},
                            {text: 'Kinh nghiệm làm việc', style: 'p'},
                            {text: 'Bằng cấp cao nhất', style: 'p'},
                            {text: 'Ngày sinh', style: 'p'},
                            {text: 'Giới tính', style: 'p'},
                            {text: 'Số điện thoại', style: 'p'},
                            {text: 'Email', style: 'p'},
                            {text: 'Địa chỉ', style: 'p'},
                        ]
                    },
                    {
                        width: '45%',
                        stack: [
                            {text: features.recentlyCompany, style: ['p', 'bold']},
                            {text: features.numberExp, style: ['p', 'bold']},
                            {text: features.highestEduLevel, style: ['p', 'bold']},
                            {text: formatDate(features.birthdate, 'dd/MM/yy'), style: ['p', 'bold']},
                            {text: features.gender, style: ['p', 'bold']},
                            {text: features.mobile, style: ['p', 'bold']},
                            {text: features.email, style: ['p', 'bold']},
                            {text: features.provinceName + ', ' + features.countryName, style: ['p', 'bold']},
                        ]
                    }
                ]
            }
        ];

        contentList = contentList.concat(featureContentList);

        return contentList;
    }
    
    function setExpContentList(contentList, expList) {
        var contentList = contentList;
        var convertHtmlForPdfmake = PdfMakeConverter.createInstance();  

        // Convert description from HTML for pdfmake
        var expContentList = expList.map(function(exp) {
            var contentForPdf = convertHtmlForPdfmake.convertHTML(exp.description, 'none');
            
            contentForPdf.map(function(obj) {
                obj.color = "#333";

                return obj;
            });

            exp.description = contentForPdf;

            return exp;
        });

        expContentList = expList.map(function(exp) {
            return {
                columns: [
                    {
                        stack: [
                            {text: formatDate(exp.startDate, 'MM/yy') + ' - ' + formatDate(exp.endDate, 'MM/yy'), style: ['em', 'marginTop']},
                            {text: exp.employer, style: ['bold', 'p']},
                            {text: exp.title, style: 'p'},                           
                            {text: exp.positionName, style: 'p'},
                            exp.description
                        ]
                    }
                ]    
            }
        });

        expContentList = [{
                stack: [
                    {text: 'Kinh nghiệm làm việc', style: 'header'},
                    createHr()
                ]
            }].concat(expContentList);    
        contentList = contentList.concat(expContentList);

        return contentList;
    }

    function setEduContentList(contentList, eduList) {
        var contentList = contentList;
        var eduContentList = eduList.map(function(edu) {
            return {
                columns: [
                    {
                        stack: [
                            {text: edu.program, style: ['bold', 'marginTop']},
                            {text: edu.levelName, style: 'p'},
                            {text: edu.institute, style: 'p'}
                        ]
                    }
                ]    
            }
        });

        eduContentList = [{
                stack: [
                    {text: 'Học vấn', style: 'header'},
                    createHr()
                ]
            }].concat(eduContentList);    
        contentList = contentList.concat(eduContentList);

        return contentList;
    }

    function setCertContentList(contentList, certList) {
        var certContentList = certList.map(function(cert) {
            return {
                columns: [
                    {
                        stack: [
                            {text: cert.title, style: ['bold', 'marginTop']},
                            {text: cert.issuer, style: 'p'}
                        ]
                    }
                ]    
            }
        });

        certContentList = [{
                stack: [
                    {text: 'Chứng chỉ', style: 'header'},
                    createHr()
                ]
            }].concat(certContentList);    
        contentList = contentList.concat(certContentList);

        return contentList;
    }

    function setDocContentList(contentList, docList) {
        var docList = docList.map(function(doc) {
            return {
                text: doc.title, 
                link: doc.filedata, 
                style: ['marginTop', 'link']
            };
        });

        var docContentList = [{ul: docList}];

        docContentList = [{
                stack: [
                    {text: 'File đính kèm', style: 'header'},
                    createHr()
                ]
            }].concat(docContentList);    
        contentList = contentList.concat(docContentList);

        return contentList;
    }

    function createHr() {
        return {   
                    margin: [0, 5, 0, 0],
                    canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1.5, lineColor: '#c7c7c7' }]
                };
    }

    function formatDate(date, format) {
        return $filter('date')(date, format);
    }

    function setStyles() {
        return {
                header: {
                    fontSize: 20,
                    color: '#00b9f2',
                    margin: [0, 35, 0, -5]
                },
                featureHeader: {
                    fontSize: 22,
                    color: '#333',
                    margin: [0, 0, 0, 5]
                },
                bold: {
                    bold: true
                },
                p: {
                    margin: [0, 0, 0, 5],
                    color: '#333'
                },
                marginTop: {
                    margin: [0, 20, 0, 5],
                    color: '#333'
                },
                link: {
                    color: '#00b9f2',
                    decoration: 'underline'
                },
                em: {
                    italics: true
                }
            }
    }

    return {
        setStyles: setStyles,
        setFeatureList: setFeatureList,
        setExpContentList: setExpContentList,
        setEduContentList: setEduContentList,
        setCertContentList: setCertContentList,
        setDocContentList: setDocContentList
    };
});