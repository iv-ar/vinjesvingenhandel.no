import Quill from "quill/core";

import Toolbar from "quill/modules/toolbar";
import Snow from "quill/themes/snow";

import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Header from "quill/formats/header";
import ImageUploader from "quill-image-uploader";
import BlotFormatter from "quill-blot-formatter";
import {ImageDrop} from "quill-image-drop-module";

Quill.register({
    "modules/toolbar": Toolbar,
    "modules/imageDrop": ImageDrop,
    "modules/blotFormatter": BlotFormatter,
    "modules/imageUploader": ImageUploader,
    "themes/snow": Snow,
    "formats/bold": Bold,
    "formats/italic": Italic,
    "formats/header": Header,
});


export default Quill;
