import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import UserVideoComponent from "@/hooks/WebRTC/UserVideoComponent";

const PopOverCamera = ({ open, publisher, handleMainVideoStream }) => {
    if (!open) {
        return null;
    }

    return (
      <Popover.Content className="PopoverContent" sideOffset={5}>
        <div className="p-4">

            <div>
            {publisher && (
                <div onClick={() => handleMainVideoStream(publisher)}>
                    <UserVideoComponent streamManager={publisher} />
                </div>
            )}    
            </div>

        </div>
        <Popover.Arrow className="PopoverArrow" />
      </Popover.Content>
    );
};

export default PopOverCamera;
