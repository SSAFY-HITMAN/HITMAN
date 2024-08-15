import React, { Component } from 'react';
import './styles.css'; 

export default class MissionVideo extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();

        // 메서드 바인딩
        // this.applyVideoInversion = this.applyVideoInversion.bind(this);
    }

    componentDidUpdate(prevProps) {
        // streamManager prop이 변경될 때마다 비디오 요소에 스트림 연결
        if (prevProps.streamManager !== this.props.streamManager && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    componentDidMount() {
        // 컴포넌트가 마운트될 때 스트림을 비디오 요소에 연결
        if (this.props && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    // applyVideoInversion() {
    //     // 비디오 요소에 좌우 반전 스타일 적용
    //     if (this.videoRef.current) {
    //         this.videoRef.current.style.transform = 'rotateY(180deg)';
    //         this.videoRef.current.style.WebkitTransform = 'rotateY(180deg)';
    //         this.videoRef.current.style.MozTransform = 'rotateY(180deg)';
    //     }
    // }

    render() {
        // 비디오 요소 생성 및 ref 연결
        return <video autoPlay={true} ref={this.videoRef} className="w-full h-auto transform rotate-y-180" />;
    }
}
